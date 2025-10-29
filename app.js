document.getElementById("qpaForm").addEventListener("submit", async function(e) {
    e.preventDefault();

    const payload = {
        grades: [
            { units: parseInt(document.getElementById("u1").value), letter: document.getElementById("g1").value },
            { units: parseInt(document.getElementById("u2").value), letter: document.getElementById("g2").value }
        ]
    };

    const res = await fetch("http://127.0.0.1:8000/calculate-qpa", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
    });

    const data = await res.json();

    document.getElementById("result").innerHTML = `
        <p>Your QPA: <strong>${data.qpa}</strong></p>
        <p>Total Units: <strong>${data.total_units}</strong></p>
        <p>Total Points: <strong>${data.total_points}</strong></p>
        <p>Courses Count: <strong>${data.count}</strong></p>
    `;
});