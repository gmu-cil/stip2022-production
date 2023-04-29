// Example
export const mapOtherEvents = (events: any) => {
  return events.map((event) => {
    return {
      otherEvent: event.event,
    };
  });
};
export const mapOtherMemiors = (memiors: any[]) => {
  return memiors.map((m) => {
    return {
      otherMemoir: m.memoir || '',
      otherMemoirTitle: m.memoirTitle || '',
      otherMemoirContent: m.memoirContent || '',
      otherMemoirAuthor: m.memoirAuthor || '',
    };
  });
};

export const mapOtherRightists = (rightist: any) => {
  return {
    otherName: rightist.fullName || '',
    otherGender: rightist.gender || '',
    otherStatus: rightist.status || '',
    otherEthnic: rightist.ethnicity || '',
    otherOccupation: rightist.workplaceCombined || '',
  };
};
