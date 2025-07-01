const appUrl = "https://script.google.com/macros/s/AKfycbziEA-2Hjy2PmnSMEXiiImr17b3dScC8rJF8483mvnMqKzNq_bl7fYrHEVLc8riYi1j/exec";

const kelasInput = document.getElementById("kelas");
const tanggalInput = document.getElementById("tanggal");
const btnLoad = document.getElementById("btnLoad");
const absenForm = document.getElementById("absenForm");
const tbody = document.getElementById("absenTableBody");

let siswaList = [];

function getTodayJakarta() {
    // Ambil waktu sekarang dalam UTC
    const now = new Date();

    // Hitung offset Jakarta (UTC+7) dalam menit
    const jakartaOffset = 7 * 60;

    // Waktu UTC sekarang dalam menit dari epoch
    const utcMinutes = now.getTime() / 60000;

    // Waktu Jakarta dalam menit dari epoch
    const jakartaMinutes = utcMinutes + jakartaOffset;

    // Konversi kembali ke milidetik untuk buat Date object Jakarta
    const jakartaTime = new Date(jakartaMinutes * 60000);

    // Format tanggal yyyy-mm-dd
    const year = jakartaTime.getUTCFullYear();
    const month = String(jakartaTime.getUTCMonth() + 1).padStart(2, "0");
    const day = String(jakartaTime.getUTCDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
}



const tanggalHariIniP = document.getElementById("tanggalHariIni");

const todayJakarta = getTodayJakarta();
tanggalInput.value = todayJakarta;
tanggalHariIniP.textContent = `Tanggal hari ini: ${todayJakarta}`;

// Set tanggal langsung saat script dijalankan
tanggalInput.value = getTodayJakarta();

btnLoad.addEventListener("click", async () => {
    const kelas = kelasInput.value.trim();
    const tanggal = tanggalInput.value;

    if (!kelas) return alert("Mohon isi Kelas!");
    if (!tanggal) return alert("Mohon isi Tanggal!");

    btnLoad.disabled = true;
    btnLoad.innerHTML = `<span class="spinner-border spinner-border-sm me-2"></span>Memuat...`;

    try {
        const res = await fetch(`${appUrl}?kelas=${encodeURIComponent(kelas)}`);
        if (!res.ok) throw new Error("Gagal mengambil data siswa.");
        siswaList = await res.json();

        if (!siswaList.length) {
            alert("Data siswa tidak ditemukan untuk kelas tersebut.");
            absenForm.style.display = "none";
            return;
        }

        tbody.innerHTML = "";
        siswaList.forEach((siswa, i) => {
            const tr = document.createElement("tr");
            tr.innerHTML = `
            <td>${siswa.no}</td>
            <td>${siswa.nama}</td>
            <td><input type="radio" name="status-${i}" value="M" required></td>
            <td><input type="radio" name="status-${i}" value="I"></td>
            <td><input type="radio" name="status-${i}" value="S"></td>
            <td><input type="radio" name="status-${i}" value="A" checked></td>
          `;
            tbody.appendChild(tr);
        });

        absenForm.style.display = "block";
    } catch (err) {
        alert("Error: " + err.message);
        absenForm.style.display = "none";
    } finally {
        btnLoad.disabled = false;
        btnLoad.innerHTML = "Muat Siswa";
    }
});

absenForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const kelas = kelasInput.value.trim();
    const tanggal = tanggalInput.value;

    if (!kelas) return alert("Mohon isi Kelas!");
    if (!tanggal) return alert("Mohon isi Tanggal!");

    const absensi = siswaList.map((siswa, i) => {
        const status = document.querySelector(`input[name="status-${i}"]:checked`)?.value || "";
        return {
            no: siswa.no,
            nama: siswa.nama,
            status,
        };
    });

    if (absensi.some(a => !a.status)) {
        alert("Mohon pilih status untuk semua siswa.");
        return;
    }

    const submitBtn = absenForm.querySelector("button[type='submit']");
    submitBtn.disabled = true;
    submitBtn.innerHTML = `<span class="spinner-border spinner-border-sm me-2"></span>Mengirim...`;

    try {
        const res = await fetch(appUrl, {
            method: "POST",
            body: JSON.stringify({ tanggal, kelas, absensi }),
            headers: {
                "Content-Type": "text/plain;charset=utf-8"
            },
            redirect: "follow"
        });
        if (!res.ok) throw new Error("Gagal mengirim absensi.");
        const data = await res.json();
        if (data.status === "success") {
            alert("Absensi berhasil dikirim!");
            absenForm.style.display = "none";
            tbody.innerHTML = "";
            kelasInput.value = "";
            tanggalInput.value = getTodayJakarta();
            siswaList = [];
        } else {
            alert("Error: " + (data.message || "Tidak diketahui"));
        }
    } catch (err) {
        alert("Error: " + err.message);
    } finally {
        submitBtn.disabled = false;
        submitBtn.innerHTML = "Kirim Absensi";
    }
});