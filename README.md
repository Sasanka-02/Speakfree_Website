# SpeakFree, R26-IT-086: academic project website

Academic information website for the SpeakFree research project
(AI Based Speech Disorder Screening and Therapy Assistant). Plain HTML and
CSS only, no JavaScript, following the course "Planning Your Website"
guidelines: Home, Domain, Milestones, Documents, Presentations, About Us,
Contact Us. Visual style and colour palette come from the SpeakFree
presentation visuals (navy, SpeakFree orange, violet and lavender).

No em dashes or en dashes appear anywhere in this site; `build.js` refuses to
write a page that contains one.

## Editing

All page content lives in `build.js` (team, milestones, documents,
presentations near the top). Edit it, then run `node build.js` to regenerate
the seven `.html` pages. Upload the `.html` files plus `assets/` and `files/`.

## Folders

- `assets/style.css`: the stylesheet.
- `assets/images/`: optimised figures from the presentation (about 1.6 MB).
- `assets/logo/logo-icon.svg`: logo and favicon.
- `assets/photos/member-1.jpg` to `member-4.jpg`: member photos on About Us (Component 1 to 4).
- `files/documents/`, `files/presentations/`: put the PDFs here using the
  file names referenced in `build.js` (for example `proposal-report.pdf`), or
  replace each `href` with a Google Drive link. Keep the whole site under 20 MB.

## Still to fill in

- **Marks allocated** per milestone: set `marks` (for example `"15%"`) in
  `MILESTONES`; they currently show "To be confirmed".
- **Document and slide files** in `files/` (links 404 until added).
- **Final documents and final presentation**: set `href` once available.
- Check the Component 2 student ID `IT220257086` (one digit longer than the others).
