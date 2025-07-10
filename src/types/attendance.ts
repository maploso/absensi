// src/types/attendance.ts

export interface Siswa {
  no: string
  nama: string
  kamar: string
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
