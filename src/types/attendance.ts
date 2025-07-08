// src/types/attendance.ts

export interface Siswa {
  no: string
  nama: string
}

export interface Absensi {
  no: string
  nama: string
  status: 'M' | 'I' | 'S' | 'A'
  jam: string
}
