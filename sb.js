const appUrl = "https://script.google.com/macros/s/AKfycbzZJS5pSD58lb5E8VoEun4U6JePTCnAPYQJrChUbyvOetI2i8jS1LN3LKNXIlMMNXZ3/exec";

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
        const res = await fetch(`${appUrl}?kelas=${encodeURIComponent(kelas)}&tanggal=${encodeURIComponent(tanggal)}`);
        if (!res.ok) throw new Error("Gagal mengambil data siswa.");
        const data = await res.json();

        const siswaList = data.siswa;
        const absensiList = data.absensi;

        console.log("Data Siswa:", siswaList); // Debugging

        if (!siswaList.length) {
            alert("Data siswa tidak ditemukan untuk kelas tersebut.");
            absenForm.style.display = "none";
            return;
        }

        // Clear existing rows
        tbody.innerHTML = "";

        siswaList.forEach((siswa, i) => {
            const siswaAbsensi = absensiList.find(a => a.no === siswa.no);
            const status = siswaAbsensi ? siswaAbsensi.status : "A"; // Default "A" jika tidak ada
            const jam = siswaAbsensi ? siswaAbsensi.jam : "-"; // Tampilkan jam jika ada, jika tidak, tampilkan "-"

            const tr = document.createElement("tr");
            tr.innerHTML = `
                <td>${siswa.no}</td>
                <td>${siswa.nama}</td>
                <td><input type="radio" name="status-${i}" value="M" ${status === "M" ? "checked" : ""}></td>
                <td><input type="radio" name="status-${i}" value="I" ${status === "I" ? "checked" : ""}></td>
                <td><input type="radio" name="status-${i}" value="S" ${status === "S" ? "checked" : ""}></td>
                <td><input type="radio" name="status-${i}" value="A" ${status === "A" ? "checked" : ""}></td>
                <td class="jam-cell" data-index="${i}">${jam}</td> <!-- Tampilkan jam -->
            `;
            tbody.appendChild(tr);
        });

        // Setel jam saat radio diklik
        document.querySelectorAll("input[type=radio]").forEach(radio => {
            radio.addEventListener("change", (e) => {
                const index = e.target.name.split("-")[1];
                const now = new Date();
                const jam = now.toLocaleTimeString("id-ID", { hour: '2-digit', minute: '2-digit', hour12: false });
                document.querySelector(`.jam-cell[data-index="${index}"]`).textContent = jam;
            });
        });

        absenForm.style.display = "block";
    } catch (err) {
        alert("Error: " + err.message);
        absenForm.style.display = "none";
    } finally {
        btnLoad.disabled = false;
        btnLoad.innerHTML = "Muat Mahasantri";
    }
});

absenForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const kelas = kelasInput.value.trim();
    const tanggal = tanggalInput.value;

    if (!kelas) return alert("Mohon isi Kelas!");
    if (!tanggal) return alert("Mohon isi Tanggal!");

    const absensi = siswaList.map((siswa, i) => {
        const status = document.querySelector(`input[name="status-${i}"]:checked`)?.value || "A";
        const jam = document.querySelector(`.jam-cell[data-index="${i}"]`)?.textContent || "";
        console.log(`Status for ${siswa.nama}: ${status}, Jam: ${jam}`);
        return {
            no: siswa.no,
            nama: siswa.nama,
            status,
            jam
        };
    });

    console.log("Absensi yang dikirim:", absensi); // Debugging

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

