// Format tanggal: "dd/MM/yyyy"
export function getTodayJakarta(): string {
  return new Date().toLocaleDateString('id-ID', {
    timeZone: 'Asia/Jakarta',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}

// Format tanggal untuk input[type="date"]: "yyyy-MM-dd"
export function getTodayDateInputFormat(): string {
  const jakartaDate = new Date(new Date().toLocaleString('en-US', { timeZone: 'Asia/Jakarta' }))
  const year = jakartaDate.getFullYear()
  const month = String(jakartaDate.getMonth() + 1).padStart(2, '0')
  const day = String(jakartaDate.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

// Konversi UTC string ke tanggal format "dd/MM/yyyy" di timezone Jakarta
export function convertToJakartaDate(utc: string): string {
  return new Date(utc).toLocaleDateString('id-ID', {
    timeZone: 'Asia/Jakarta',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}

// Mendapatkan nama hari lokal dalam bahasa Indonesia, contoh: "Senin"
export function getDayNameJakarta(): string {
  const day = new Date().toLocaleDateString('id-ID', {
    timeZone: 'Asia/Jakarta',
    weekday: 'long',
  })
  return capitalize(day)
}

// Format waktu: "HH:mm:ss" di timezone Jakarta
export function getCurrentTimeJakarta(): string {
  return new Date().toLocaleTimeString('id-ID', {
    timeZone: 'Asia/Jakarta',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  })
}

// Format waktu tanpa detik: "HH:mm"
export function getCurrentHourMinuteJakarta(): string {
  return new Date().toLocaleTimeString('id-ID', {
    timeZone: 'Asia/Jakarta',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  })
}

// Helper untuk kapitalisasi awal huruf
function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1)
}
