How to provide a full Vietnam administrative dataset (provinces → districts → communes)

1) Purpose

Place a JSON file at `data/vietnamAdministrative_full.json` containing the full
hierarchy for Vietnam (63 provinces, each with districts and communes). When
this file exists and contains an array, the app will use it instead of the
built-in sample.

2) Expected JSON format

The JSON should be an array of `Province` objects with this shape:

[
  {
    "id": "ha-noi",
    "name": "Hà Nội",
    "latitude": 21.0285,
    "longitude": 105.8542,
    "region": "Miền Bắc",
    "districts": [
      {
        "id": "ba-dinh",
        "name": "Ba Đình",
        "latitude": 21.0395,
        "longitude": 105.8342,
        "communes": [
          { "id": "phuc-tan", "name": "Phúc Tân", "latitude": 21.0355, "longitude": 105.8382 },
          ...
        ]
      },
      ...
    ]
  },
  ...
]

3) Sources

You can obtain complete province/district/commune datasets from public
repositories or government open data portals. Example search queries:
- "Vietnam administrative units JSON"
- "province district commune Vietnam JSON"

4) How to add the file

- Download or generate the JSON following the shape above.
- Place it at `data/vietnamAdministrative_full.json` in the project root.
- Restart Metro / Expo so the bundler picks up the new file.

5) Notes

- The project already contains a smaller sample list in `vietnamAdministrative.ts`.
- If the `vietnamAdministrative_full.json` is present and contains a non-empty
  array, it will override the default data.
- If you want, I can fetch and add a canonical dataset for you if you provide
  a public URL or allow me to download from the web (may require network access).

6) Automatic downloader (included)

A small Node script is included to download a canonical public dataset and
save it to `data/vietnamAdministrative_full.json`.

- Run from project root:

  node scripts/fetch-vietnam-admin.js

After the script completes, restart Metro/Expo so the new JSON is included in
the app bundle.
