export const getActivityName = (activity) =>
  typeof activity === 'string' ? activity : activity?.name || '';

export const formatActivityLabel = (activity) => {
  const name = getActivityName(activity);
  const executionDate = activity?.executionDate;

  if (!executionDate) {
    return name;
  }

  return `${name} (${executionDate})`;
};

export const parseProgramsCatalog = (content) => {
  if (!Array.isArray(content)) {
    return [];
  }

  return content.filter((item) => item?.id);
};

export const extractSubprogramsFromProgram = (programItem) => {
  if (!programItem?.id) {
    return { subprograms: [], activities: {} };
  }

  const { id, ...subprogramsMap } = programItem;

  return {
    subprograms: Object.keys(subprogramsMap),
    activities: subprogramsMap,
  };
};

export const extractSubprogramsFromContent = (content) => {
  if (!content || typeof content !== 'object' || Array.isArray(content)) {
    return { subprograms: [], activities: {} };
  }

  return {
    subprograms: Object.keys(content),
    activities: content,
  };
};

export const getProgramNames = (catalog) => catalog.map((item) => item.id);

export const findProgramInCatalog = (catalog, programName) =>
  catalog.find((item) => item.id === programName);
