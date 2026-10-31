// ACADMETRICS — INTERACTIVE FRONTEND

const sampleStudents = Array.from({ length: 60 }, (_, i) => {
  const study = +(2.5 + ((i * 17) % 65) / 10).toFixed(1);
  const attendance = 60 + ((i * 13) % 39);
  const sleep = +(5 + ((i * 7) % 35) / 10).toFixed(1);
  const previous = 45 + ((i * 19) % 46);
  const marks = +(28.68 + 3.73 * study + 0.136 * attendance +
    0.90 * sleep + 0.084 * previous).toFixed(1);

  return {
    id: "STU" + String(i + 1).padStart(3, "0"),
    study,
    attendance,
    sleep,
    previous,
    marks: Math.min(99, marks)
  };
});

let students = [...sampleStudents];
let charts = {};

// ---------------- NAVIGATION ----------------

function showPage(pageId) {
  document.querySelectorAll(".page").forEach(page => {
    page.classList.toggle("active", page.id === pageId);
  });

  document.querySelectorAll(".nav-link[data-page]").forEach(button => {
    button.classList.toggle("active", button.dataset.page === pageId);
  });

  const titles = {
    home: "Overview",
    dashboard: "Dashboard",
    records: "Student Records",
    analytics: "Analytics",
    visuals: "3D Visualisation",
    regression: "Regression Lab",
    prediction: "Prediction Studio",
    compare: "Compare Students",
    reports: "Reports & Export",
    about: "About Project"
  };

  document.getElementById("page-heading").textContent =
    titles[pageId] || "AcadMetrics";

  if (pageId === "dashboard") drawMarksChart();
  if (pageId === "analytics") drawCorrelationChart();
  if (pageId === "visuals") create3DScene();
}

document.querySelectorAll("[data-page]").forEach(button => {
  button.addEventListener("click", () => showPage(button.dataset.page));
});

document.querySelectorAll("[data-go]").forEach(button => {
  button.addEventListener("click", () => showPage(button.dataset.go));
});

document.querySelectorAll(".feature-card[data-go]").forEach(card => {
  card.addEventListener("click", () => showPage(card.dataset.go));
});

// ---------------- STUDENT TABLE ----------------

function renderStudents(list = students) {
  const table = document.getElementById("student-table");

  table.innerHTML = list.map(student => `
    <tr>
      <td><b>${student.id}</b></td>
      <td>${student.study}</td>
      <td>${student.attendance}%</td>
      <td>${student.sleep}</td>
      <td>${student.previous}</td>
      <td><b>${student.marks}</b></td>
    </tr>
  `).join("");
}

renderStudents();

document.getElementById("search-student").addEventListener("input", event => {
  const query = event.target.value.toLowerCase();
  const filtered = students.filter(student =>
    student.id.toLowerCase().includes(query)
  );
  renderStudents(filtered);
});

document.getElementById("reset-search").addEventListener("click", () => {
  document.getElementById("search-student").value = "";
  renderStudents();
});

// ---------------- CHARTS ----------------

function makeChart(id, config) {
  const canvas = document.getElementById(id);
  if (!canvas) return;

  if (charts[id]) charts[id].destroy();

  charts[id] = new Chart(canvas, config);
}

function drawMarksChart() {
  const groups = [
    { label: "50–59", min: 50, max: 60 },
    { label: "60–69", min: 60, max: 70 },
    { label: "70–79", min: 70, max: 80 },
    { label: "80–89", min: 80, max: 90 },
    { label: "90–99", min: 90, max: 100 }
  ];

  const counts = groups.map(group =>
    students.filter(s => s.marks >= group.min && s.marks < group.max).length
  );

  makeChart("marksChart", {
    type: "bar",
    data: {
      labels: groups.map(g => g.label),
      datasets: [{
        label: "Number of students",
        data: counts,
        backgroundColor: "#A9B991",
        borderRadius: 8,
        maxBarThickness: 55
      }]
    },
    options: {
      responsive: true,
      plugins: { legend: { display: false } },
      scales: {
        y: { beginAtZero: true, grid: { color: "#EDE5DA" } },
        x: { grid: { display: false } }
      }
    }
  });
}

function drawCorrelationChart() {
  const points = students.map(s => ({
    x: s.study,
    y: s.marks
  }));

  makeChart("correlationChart", {
    type: "scatter",
    data: {
      datasets: [{
        label: "Student records",
        data: points,
        backgroundColor: "#A07855",
        pointRadius: 5
      }]
    },
    options: {
      responsive: true,
      plugins: { legend: { display: false } },
      scales: {
        x: {
          title: { display: true, text: "Study hours per day" },
          grid: { color: "#EDE5DA" }
        },
        y: {
          title: { display: true, text: "Final marks" },
          min: 0,
          max: 100,
          grid: { color: "#EDE5DA" }
        }
      }
    }
  });
}

// ---------------- PREDICTION ----------------

document.getElementById("predict-btn").addEventListener("click", () => {
  const study = Number(document.getElementById("study").value);
  const attendance = Number(document.getElementById("attendance").value);
  const sleep = Number(document.getElementById("sleep").value);
  const previous = Number(document.getElementById("previous").value);

  if (
    !Number.isFinite(study) || !Number.isFinite(attendance) ||
    !Number.isFinite(sleep) || !Number.isFinite(previous) ||
    study < 0 || study > 24 ||
    attendance < 0 || attendance > 100 ||
    sleep < 0 || sleep > 24 ||
    previous < 0 || previous > 100
  ) {
    alert("Please enter valid values within the displayed ranges.");
    return;
  }

  const prediction =
    28.68 + 3.73 * study + 0.136 * attendance +
    0.90 * sleep + 0.084 * previous;

  const result = Math.max(0, Math.min(100, prediction));

  document.getElementById("prediction-result").textContent =
    result.toFixed(1);

  document.getElementById("prediction-caption").textContent =
    "Estimated result based on the illustrative multiple regression equation.";
});

// ---------------- STUDENT COMPARISON ----------------

function fillStudentOptions() {
  ["student-a", "student-b"].forEach((id, index) => {
    const select = document.getElementById(id);
    select.innerHTML = students.map(student =>
      `<option value="${student.id}">${student.id}</option>`
    ).join("");

    select.selectedIndex = index === 0 ? 0 : Math.min(1, students.length - 1);
  });
}

fillStudentOptions();

document.getElementById("compare-btn").addEventListener("click", () => {
  const a = students.find(s =>
    s.id === document.getElementById("student-a").value
  );
  const b = students.find(s =>
    s.id === document.getElementById("student-b").value
  );

  const result = document.getElementById("compare-result");

  if (!a || !b) {
    result.textContent = "Please select two students.";
    return;
  }

  result.innerHTML = `
    <div class="stat-grid">
      <div class="stat-card">
        <span>${a.id} — Final marks</span>
        <strong>${a.marks}</strong>
        <small>Study: ${a.study} hrs · Attendance: ${a.attendance}%</small>
      </div>
      <div class="stat-card">
        <span>${b.id} — Final marks</span>
        <strong>${b.marks}</strong>
        <small>Study: ${b.study} hrs · Attendance: ${b.attendance}%</small>
      </div>
    </div>
    <p>${a.marks > b.marks ? a.id : b.marks > a.marks ? b.id : "Both students"} ${
      a.marks === b.marks ? "have equal" : "has higher"
    } final marks in this sample.</p>
  `;
});

// ---------------- CSV UPLOAD ----------------

document.getElementById("upload-trigger").addEventListener("click", () => {
  document.getElementById("csv-upload").click();
});

document.getElementById("csv-upload").addEventListener("change", async event => {
  const file = event.target.files[0];
  if (!file) return;

  const text = await file.text();
  const rows = text.trim().split(/\r?\n/).map(row => row.split(","));

  if (rows.length < 2) {
    alert("The CSV file appears to be empty.");
    return;
  }

  const headers = rows[0].map(h => h.trim().toLowerCase());
  const aliases = {
    id: ["id", "student id", "student_id"],
    study: ["study", "study hours", "study_hours", "x1"],
    attendance: ["attendance", "attendance percentage", "attendance %", "x2"],
    sleep: ["sleep", "sleep hours", "sleep_hours", "x3"],
    previous: ["previous", "previous score", "previous exam score", "x4"],
    marks: ["marks", "final marks", "final_marks", "y"]
  };

  const positions = {};
  Object.entries(aliases).forEach(([key, names]) => {
    positions[key] = headers.findIndex(h => names.includes(h));
  });

  const required = ["study", "attendance", "sleep", "previous", "marks"];
  if (required.some(key => positions[key] < 0)) {
    alert("CSV needs columns for study, attendance, sleep, previous score and final marks. Check the column headings.");
    return;
  }

  const imported = rows.slice(1).filter(row => row.length >= headers.length).map((row, index) => {
    const get = key => Number(row[positions[key]]);
    return {
      id: positions.id >= 0 && row[positions.id]
        ? row[positions.id].trim()
        : "STU" + String(index + 1).padStart(3, "0"),
      study: get("study"),
      attendance: get("attendance"),
      sleep: get("sleep"),
      previous: get("previous"),
      marks: get("marks")
    };
  }).filter(s =>
    [s.study, s.attendance, s.sleep, s.previous, s.marks].every(Number.isFinite)
  );

  if (!imported.length) {
    alert("No valid student rows were found.");
    return;
  }

  students = imported;
  renderStudents();
  fillStudentOptions();

  document.getElementById("record-message").textContent =
    `Successfully loaded ${students.length} student records from ${file.name}.`;

  alert("CSV data loaded successfully!");
  event.target.value = "";
});

// ---------------- EXPORTS ----------------

function downloadFile(filename, content, type) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = filename;
  link.click();

  URL.revokeObjectURL(url);
}

document.getElementById("export-csv").addEventListener("click", () => {
  const header = "Student ID,Study Hours,Attendance,Sleep Hours,Previous Score,Final Marks";
  const rows = students.map(s =>
    [s.id, s.study, s.attendance, s.sleep, s.previous, s.marks].join(",")
  );

  downloadFile("acadmetrics_students.csv", [header, ...rows].join("\n"), "text/csv");
});

document.getElementById("export-summary").addEventListener("click", () => {
  const average = students.reduce((sum, s) => sum + s.marks, 0) / students.length;
  const summary = `ACADMETRICS — PERFORMANCE SUMMARY

Number of students: ${students.length}
Average final marks: ${average.toFixed(2)}

Illustrative regression equation:
y = 28.68 + 3.73x1 + 0.136x2 + 0.90x3 + 0.084x4

Note: Demo summary only. Verify model results against the final backend analysis.`;

  downloadFile("acadmetrics_summary.txt", summary, "text/plain");
});

// ---------------- 3D SCENE ----------------

let sceneCreated = false;
let animationFrame;

function create3DScene() {
  const container = document.getElementById("plot3d");
  if (!container || !window.THREE) return;

  if (sceneCreated) return;
  sceneCreated = true;

  const scene = new THREE.Scene();
  scene.background = new THREE.Color("#EEE5D7");

  const camera = new THREE.PerspectiveCamera(
    45,
    container.clientWidth / container.clientHeight,
    0.1,
    100
  );

  camera.position.set(7, 6, 9);
  camera.lookAt(0, 0, 0);

  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(container.clientWidth, container.clientHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  container.appendChild(renderer.domElement);

  scene.add(new THREE.AmbientLight("#FFFFFF", 2));

  const light = new THREE.DirectionalLight("#FFFFFF", 2);
  light.position.set(5, 8, 5);
  scene.add(light);

  const points = new THREE.Group();
  scene.add(points);

  const material = new THREE.MeshStandardMaterial({
    color: "#A07855",
    roughness: 0.4,
    metalness: 0.12
  });

  students.forEach(student => {
    const sphere = new THREE.Mesh(
      new THREE.SphereGeometry(0.075, 14, 14),
      material
    );

    sphere.position.set(
      (student.study - 5) * 0.7,
      (student.marks - 70) * 0.09,
      (student.attendance - 78) * 0.08
    );

    points.add(sphere);
  });

  const grid = new THREE.GridHelper(12, 12, "#A07855", "#D2C2AD");
  grid.position.y = -3.5;
  scene.add(grid);

  let dragging = false;
  let previousX = 0;
  let previousY = 0;

  renderer.domElement.addEventListener("pointerdown", event => {
    dragging = true;
    previousX = event.clientX;
    previousY = event.clientY;
  });

  window.addEventListener("pointerup", () => dragging = false);

  renderer.domElement.addEventListener("pointermove", event => {
    if (!dragging) return;

    points.rotation.y += (event.clientX - previousX) * 0.008;
    points.rotation.x += (event.clientY - previousY) * 0.008;

    previousX = event.clientX;
    previousY = event.clientY;
  });

  function animate() {
    animationFrame = requestAnimationFrame(animate);

    if (!dragging) {
      points.rotation.y += 0.0015;
    }

    renderer.render(scene, camera);
  }

  animate();

  const observer = new ResizeObserver(() => {
    const width = container.clientWidth;
    const height = container.clientHeight;

    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height);
  });

  observer.observe(container);
}

// ---------------- 3D BACKGROUND ----------------

function createBackground() {
  const container = document.getElementById("scene");
  if (!container || !window.THREE) return;

  const scene = new THREE.Scene();

  const camera = new THREE.PerspectiveCamera(
    60,
    window.innerWidth / window.innerHeight,
    0.1,
    100
  );

  camera.position.z = 12;

  const renderer = new THREE.WebGLRenderer({
    alpha: true,
    antialias: true
  });

  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
  renderer.setSize(window.innerWidth, window.innerHeight);
  container.appendChild(renderer.domElement);

  const geometry = new THREE.BufferGeometry();
  const positions = [];

  for (let i = 0; i < 450; i++) {
    positions.push(
      (Math.random() - 0.5) * 25,
      (Math.random() - 0.5) * 18,
      (Math.random() - 0.5) * 12
    );
  }

  geometry.setAttribute(
    "position",
    new THREE.Float32BufferAttribute(positions, 3)
  );

  const particles = new THREE.Points(
    geometry,
    new THREE.PointsMaterial({
      color: "#A58B6F",
      size: 0.035,
      transparent: true,
      opacity: 0.5
    })
  );

  scene.add(particles);

  function animate() {
    requestAnimationFrame(animate);
    particles.rotation.y += 0.0003;
    particles.rotation.x += 0.0001;
    renderer.render(scene, camera);
  }

  animate();

  window.addEventListener("resize", () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });
}

createBackground();

// Initial page
showPage("home");