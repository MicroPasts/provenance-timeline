function asArray(val) {
  if (!val) return [];
  return Array.isArray(val) ? val : [val];
}

function extractLabel(entity, fallback = '') {
  if (!entity) return fallback;
  if (typeof entity === 'string') return entity;
  return entity._label || entity.label || entity.content || fallback;
}

function extractTimeSpan(ts) {
  if (!ts) return { display: 'Date unknown', begin: null, end: null, sortYear: null };

  const displayName = asArray(ts.identified_by).find((i) => i.content)?.content;
  const begin = ts.begin_of_the_begin || ts.begin || null;
  const end = ts.end_of_the_end || ts.end || null;

  let display = displayName || ts._label || '';
  if (!display) {
    if (begin && end) {
      const bYear = begin.slice(0, 4);
      const eYear = end.slice(0, 4);
      display = bYear === eYear ? bYear : `${bYear}–${eYear}`;
    } else if (begin) {
      display = `From ${begin.slice(0, 4)}`;
    } else if (end) {
      display = `Until ${end.slice(0, 4)}`;
    } else {
      display = 'Date unknown';
    }
  }

  const yearSource = begin || end || display;
  const yearMatch = String(yearSource).match(/-?\d{3,4}/);
  const sortYear = yearMatch ? parseInt(yearMatch[0], 10) : null;

  return { display, begin, end, sortYear };
}

function extractStatements(entity) {
  return asArray(entity?.referred_to_by)
    .map((ref) => {
      const types = asArray(ref.classified_as).map((c) => extractLabel(c));
      return {
        label: extractLabel(ref, 'Note'),
        content: ref.content || '',
        types,
        deprecated: Boolean(ref.deprecated),
      };
    })
    .filter((s) => s.content && !s.deprecated);
}

function extractLocations(entity) {
  const places = asArray(entity?.took_place_at).map((p) => ({
    label: extractLabel(p, 'Unknown location'),
    id: p.id || null,
    wkt: p.defined_by || null,
  }));

  // Getty-style provenance location statements inside referred_to_by
  const locationNotes = asArray(entity?.referred_to_by)
    .filter((ref) =>
      asArray(ref.classified_as).some((c) =>
        /location/i.test(extractLabel(c)) || String(c.id || '').includes('300444175')
      )
    )
    .map((ref) => ({
      label: ref.content,
      id: ref.id || null,
      wkt: null,
    }));

  return [...places, ...locationNotes];
}

function extractParties(partyList) {
  return asArray(partyList).map((party) => {
    const label = extractLabel(party, 'Unknown');
    const isUnknown = /^unknown$/i.test(label.trim());
    return {
      id: party.id || null,
      type: party.type || 'Actor',
      label,
      isUnknown,
    };
  });
}

export function parseLinkedArtProvenance(root) {
  if (!root || typeof root !== 'object') {
    throw new Error('Invalid Linked Art JSON-LD object.');
  }

  const objectMeta = {
    id: root.id || '',
    type: root.type || 'HumanMadeObject',
    label: extractLabel(root, 'Untitled Object'),
    imageUrl:
      asArray(root.representation).find((r) => r.id)?.id ||
      asArray(root.shows)[0]?.id ||
      null,
  };

  const events = [];

  // 1. Origin: Production / Creation
  const productions = [...asArray(root.produced_by), ...asArray(root.created_by)];
  productions.forEach((prod, idx) => {
    const ts = extractTimeSpan(prod.timespan);
    const makers = extractParties(prod.carried_out_by);
    const places = extractLocations(prod);
    const statements = extractStatements(prod);

    events.push({
      id: prod.id || `origin_${idx}`,
      kind: 'origin',
      method: prod.type === 'Creation' ? 'Created' : 'Produced',
      title: extractLabel(prod, 'Creation / Production'),
      timespan: ts,
      from: [],
      to: makers,
      partyRoleLabel: 'Created by',
      places,
      statements,
      identifiers: [],
      raw: prod,
    });
  });

  // 2. Ownership Transfers: changed_ownership_through
  const acquisitions = asArray(root.changed_ownership_through);
  const rawTransfers = acquisitions.map((acq, idx) => {
    // Linked Art often nests the contextual Provenance Activity inside part_of
    const parentActivity = asArray(acq.part_of)[0] || null;
    const contextNode = parentActivity || acq;

    const ts = extractTimeSpan(acq.timespan || parentActivity?.timespan);
    const fromParties = extractParties(acq.transferred_title_from);
    const toParties = extractParties(acq.transferred_title_to);

    const methods = asArray(acq.classified_as)
      .map((c) => extractLabel(c))
      .filter((m) => m && !/acquisition \(collections/i.test(m));

    const statements = [
      ...extractStatements(acq),
      ...(parentActivity ? extractStatements(parentActivity) : []),
    ];

    const places = [
      ...extractLocations(acq),
      ...(parentActivity ? extractLocations(parentActivity) : []),
    ];

    const identifiers = asArray(contextNode.identified_by).map((idObj) => ({
      label: extractLabel(idObj, 'Identifier'),
      value: idObj.content || '',
      uri: asArray(idObj.exact_match)[0]?.id || null,
    }));

    const afterIds = asArray(contextNode.starts_after_the_end_of).map((n) => n.id);
    const beforeIds = asArray(contextNode.ends_before_the_start_of).map((n) => n.id);

    const hasUnknownParty =
      fromParties.some((p) => p.isUnknown) || toParties.some((p) => p.isUnknown);

    return {
      id: acq.id || `transfer_${idx}`,
      activityId: parentActivity?.id || null,
      kind: 'transfer',
      method: methods[0] || 'Transfer of Title',
      title: extractLabel(acq, 'Ownership Transfer'),
      timespan: ts,
      from: fromParties,
      to: toParties,
      places,
      statements,
      identifiers,
      afterIds,
      beforeIds,
      hasUnknownParty,
      raw: acq,
    };
  });

  // Sort transfers chronologically using sequence pointers first, then sortYear
  rawTransfers.sort((a, b) => {
    if (a.activityId && b.afterIds.includes(a.activityId)) return -1;
    if (b.activityId && a.afterIds.includes(b.activityId)) return 1;
    if (a.activityId && b.beforeIds.includes(a.activityId)) return 1;
    if (b.activityId && a.beforeIds.includes(b.activityId)) return -1;

    if (a.timespan.sortYear !== null && b.timespan.sortYear !== null) {
      return a.timespan.sortYear - b.timespan.sortYear;
    }
    return 0;
  });

  events.push(...rawTransfers);

  // 3. Current Custody: current_owner / current_keeper
  const currentOwners = extractParties(root.current_owner);
  const currentKeepers = extractParties(root.current_keeper);
  if (currentOwners.length || currentKeepers.length) {
    events.push({
      id: 'current_custody',
      kind: 'current',
      method: 'Current Custody',
      title: currentOwners.map((o) => o.label).join(', ') || 'Current Repository',
      timespan: { display: 'Present', begin: null, end: null, sortYear: new Date().getFullYear() },
      from: [],
      to: currentOwners,
      keepers: currentKeepers,
      places: root.current_location
        ? [{ label: extractLabel(root.current_location), id: root.current_location.id || null, wkt: null }]
        : [],
      statements: [],
      identifiers: [],
      raw: { current_owner: root.current_owner, current_keeper: root.current_keeper },
    });
  }

  // 4. Insert Gap Alerts where multi-year undocumented windows or Unknown owners exist
  const timelineItems = [];
  for (let i = 0; i < events.length; i++) {
    const curr = events[i];
    timelineItems.push({ itemType: 'event', event: curr });

    const next = events[i + 1];
    if (next && curr.timespan.sortYear !== null && next.timespan.sortYear !== null) {
      const spanGap = next.timespan.sortYear - curr.timespan.sortYear;
      if (spanGap >= 15 && next.kind !== 'current') {
        timelineItems.push({
          itemType: 'gap',
          years: spanGap,
          fromYear: curr.timespan.sortYear,
          toYear: next.timespan.sortYear,
          reason: `Undocumented interval of ~${spanGap} years between recorded events`,
        });
      }
    }
  }

  return {
    object: objectMeta,
    items: timelineItems,
    stats: {
      totalEvents: events.length,
      transferCount: rawTransfers.length,
      unknownPartyCount: rawTransfers.filter((t) => t.hasUnknownParty).length,
      gapCount: timelineItems.filter((i) => i.itemType === 'gap').length,
    },
  };
}