/*
 * Forest City Solidarity site settings.
 * This is the only file most people need to touch besides data/events.csv.
 */
window.FCS_CONFIG = {
  // Optional. To run the events list from a Google Sheet instead of data/events.csv:
  //   1. Make a Sheet with the same columns as data/events.csv (copy the header row).
  //   2. File > Share > Publish to web > choose the sheet > "Comma-separated values (.csv)".
  //   3. Paste the link between the quotes below.
  // Leave it empty ("") to use data/events.csv. If the Sheet can't be reached,
  // the site falls back to data/events.csv automatically.
  eventsSheetCsvUrl: "",

  // Where the local events file lives (relative to the site root).
  eventsFile: "data/events.csv",

  // Contact address used on the map, fund and get involved pages.
  contactEmail: "forestcitysolidarity@riseup.net"
};
