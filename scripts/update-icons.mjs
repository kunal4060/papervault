import fs from 'node:fs';

const icon64 = fs.readFileSync('public/images/papervault-icon-64.png').toString('base64');
const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">
  <defs>
    <clipPath id="vault-round">
      <rect width="64" height="64" rx="14" fill="#ffffff"/>
    </clipPath>
  </defs>
  <rect width="64" height="64" rx="14" fill="#ffffff"/>
  <g clip-path="url(#vault-round)">
    <image href="data:image/png;base64,${icon64}" width="64" height="64" preserveAspectRatio="xMidYMid meet"/>
  </g>
</svg>
`;

fs.writeFileSync('public/favicon.svg', svg);
console.log('Successfully updated public/favicon.svg');
