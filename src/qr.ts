import QRCode from 'qrcode'

export type QRTarget = {
  label: string
  path: string
  description: string
}

export const qrTargets: QRTarget[] = [
  { label: 'Main homepage', path: '/', description: 'Scan to Enter' },
  { label: 'Menu', path: '/menu', description: "What's on the Menu?" },
  { label: 'Best Dish voting', path: '/vote', description: 'Food station: Vote for Best Dish' },
  { label: 'Game Night', path: '/games', description: 'Game Night area: Enter the Arena' },
  { label: 'Photo gallery', path: '/gallery', description: 'Photo backdrop: Capture the Moment' },
  { label: 'Gratitude Wall', path: '/gratitude', description: 'Gratitude area: Share the Gratitude' },
  { label: 'Gift experience', path: '/gifts', description: 'Gift box: A Little Something for You' },
]

export async function generateQrDataUrl(target: QRTarget, baseUrl = 'https://example.com') {
  const destination = `${baseUrl.replace(/\/$/, '')}${target.path}`

  return QRCode.toDataURL(destination, {
    margin: 2,
    width: 520,
    color: {
      dark: '#241914',
      light: '#fffaf3',
    },
  })
}
