# Editing the Forest City Solidarity site

The site is plain HTML, CSS and a little JavaScript. There is no build step:
whatever is in the `main` branch is what GitHub Pages serves at
https://forestcitysolidarity.xyz.

## Where things live

| What | File |
| --- | --- |
| Home | `index.html` |
| Events (upcoming and past) | `events.html` (the list itself comes from `data/events.csv`) |
| Get involved | `get-involved.html` |
| Solidarity fund (teaser, draft wording) | `fund.html` |
| Solidarity map (teaser) | `map.html` |
| Donate (Stripe checkout via fcs-donate.vercel.app) | `donate.html` |
| Constitution | `constitution.html` |
| May Day 2026 and Fuck Farhi campaign pages | `mayday.html`, `farhi.html` (older styling, left as they were) |
| Old link to the Fight to Win! Luma page | `fight.html` (redirect) |
| Layout shared by all themes | `css/site.css` |
| The three themes | `css/theme-a.css`, `css/theme-b.css`, `css/theme-c.css` |
| **The theme switch** | `css/theme.css` (one line) |
| Settings (Google Sheet link, contact email) | `js/config.js` |

The header and footer are copied into each page. If you change a menu link,
change it in every `.html` file (search and replace works well).

## Adding or changing an event

Open `data/events.csv`. On GitHub you can click the pencil icon and edit it in
the browser; on a computer it opens in Excel, LibreOffice or Google Sheets
(save as CSV).

One row per event. Columns:

| Column | What to put | Example |
| --- | --- | --- |
| `date` | Year-month-day | `2026-11-17` |
| `start` | 24-hour time, or leave empty | `19:00` |
| `end` | 24-hour time, or leave empty | `21:00` |
| `title` | Event name | `General Meeting` |
| `venue` | Place name | `ReImagine Co` |
| `address` | Street address | `206 Piccadilly St, London` |
| `description` | One or two sentences | |
| `link` | Full web address, or a page on this site like `mayday.html` | |
| `link_label` | Words for the link | `Register on Luma` |
| `status` | `confirmed`, `tbc` (shows "Details to come"), `cancelled`, or `hidden` (not shown at all) | `tbc` |
| `series` | Optional group label | `May Day 2026` |

If a cell has a comma in it, wrap the whole cell in double quotes, like
`"Rally, march and picnic"`. Spreadsheet programs do this for you.

Events move from "Upcoming" to "Past events" by themselves the day after they
happen (London, Ontario time). You never need to delete old events.

### Using a Google Sheet instead

If it's easier for several people to edit a shared Sheet:

1. Make a Google Sheet with exactly the same header row as `data/events.csv`.
2. File > Share > Publish to web, pick that sheet, choose "Comma-separated values (.csv)", publish.
3. Paste the link into `eventsSheetCsvUrl` in `js/config.js`.

The site reads the Sheet every time someone visits. If the Sheet can't be
reached, it falls back to `data/events.csv`, so keep that file roughly up to date.

## Switching the theme

Open `css/theme.css` and change the letter in the one `@import` line:

```css
@import url("theme-a.css");   /* or theme-b.css, or theme-c.css */
```

To try a theme before switching, add `?theme=b` (or `a`, `c`) to the end of
any page address. Your browser remembers it while you click around. Add
`?theme=reset` to go back to the real one. Visitors never see your preview.

Once a theme is chosen for good, the other two theme files can be deleted.

## Screenshots

`preview/` holds screenshots of every theme and `preview/index.html` shows
them side by side. To retake them (needs Node and Playwright):

```sh
python3 -m http.server 8765      # in the site folder
node preview/shoot.js            # in a second terminal
```
