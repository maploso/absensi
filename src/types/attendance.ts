// src/types/attendance.ts

export interface Siswa {
  no: string
  nama: string
  kamar: string
  statusCount: {
    M: number // Jumlah Hadir/Masuk
    I: number // Jumlah Izin
    S: number // Jumlah Sakit
    A: number // Jumlah Alpha
  }
}

export interface Absensi {
  no: string
  nama: string
  status: 'M' | 'I' | 'S' | 'A'
  jam: string
  readonly?: boolean
  sumberIzin?: 'pajek' | 'izin' | ''
  keterangan?: string
}
