const { execSync } = require('child_process');
const path = require('path');

const root = path.join(__dirname, '..', '..');

const datasets = [
  {
    slug: 'simrankhalsa431/era5-and-imerg-dataset-for-cloudburst-prediction',
    dest: path.join(root, 'data', 'era5-imerg'),
  },
  {
    slug: 'manav0negi/uttarakhand-floods-1970-to-2025',
    dest: path.join(root, 'data', 'flood-history'),
  },
];

console.log('Downloading Kaggle datasets for Jal Rakshak...\n');

for (const { slug, dest } of datasets) {
  console.log(`→ ${slug}`);
  execSync(`python -m kaggle datasets download -d ${slug} -p "${dest}" --unzip`, {
    stdio: 'inherit',
    shell: true,
  });
}

console.log('\nAll datasets downloaded to data/');
