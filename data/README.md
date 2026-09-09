# Jal Rakshak Datasets

This project uses two Kaggle datasets:

| Dataset | File | Source |
|---------|------|--------|
| ERA5 + IMERG cloudburst prediction | `era5-imerg/labeled_cloudburst.csv` | [Kaggle](https://www.kaggle.com/datasets/simrankhalsa431/era5-and-imerg-dataset-for-cloudburst-prediction) |
| Uttarakhand floods 1970–2025 | `flood-history/Uttarakhand_floods_1970_2025.csv` | [Kaggle](https://www.kaggle.com/datasets/manav0negi/uttarakhand-floods-1970-to-2025) |

## Download

From the `backend/` folder:

```bash
npm run download-data
```

Requires Kaggle authentication (`kaggle auth login` or `KAGGLE_API_TOKEN`).

## Usage

```bash
npm start          # API server
npm run seed       # Import 252 historical flood events into MongoDB
npm run replay     # Stream ERA5/IMERG data via MQTT
```
