async function verifyContent() {
    const input = document.getElementById("query-input").value;
    const btn = document.getElementById("verify-btn");
    const loader = document.getElementById("btn-loader");
    const btnText = document.getElementById("btn-text");
    const resultsUi = document.getElementById("results-ui");
    const pipelineUi = document.getElementById("pipeline-ui");

    if (!input.trim()) {
        alert("Please paste some content first.");
        return;
    }

    // Reset UI
    resultsUi.classList.add("hidden");
    pipelineUi.classList.remove("hidden");
    btn.disabled = true;
    btnText.classList.add("hidden");
    loader.classList.remove("hidden");

    // Fake pipeline animation to simulate agent execution (for dramatic effect while we wait)
    const nodes = document.querySelectorAll(".agent-node");
    nodes.forEach(n => n.classList.remove("active"));
    
    let currentAgent = 0;
    const agentInterval = setInterval(() => {
        if(currentAgent < nodes.length) {
            nodes[currentAgent].classList.add("active");
            currentAgent++;
        }
    }, 1500);

    try {
        const response = await fetch("/api/verify", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ content: input })
        });

        const data = await response.json();
        
        if(response.ok) {
            clearInterval(agentInterval);
            nodes.forEach(n => n.classList.add("active")); // Finish pipeline
            
            setTimeout(() => {
                pipelineUi.classList.add("hidden");
                renderResults(data);
            }, 1000);
        } else {
            throw new Error(data.detail);
        }
    } catch (error) {
        clearInterval(agentInterval);
        alert("Error: " + error.message);
        pipelineUi.classList.add("hidden");
    } finally {
        btn.disabled = false;
        loader.classList.add("hidden");
        btnText.classList.remove("hidden");
    }
}

function renderResults(data) {
    document.getElementById("results-ui").classList.remove("hidden");

    // 1. Setup Score & Color Gauge
    const score = data.trust_score;
    const circle = document.getElementById("score-circle");
    document.getElementById("score-text").innerText = score;
    
    let color = "var(--success)";
    let title = "Safe & Verified";
    
    if (score < 30) {
        color = "var(--danger)";
        title = "CRITICAL WARNING: SCAM DETECTED";
    } else if (score < 60) {
        color = "var(--warning)";
        title = "Suspicious. Proceed with Extreme Caution.";
    }

    circle.style.background = `conic-gradient(${color} ${score * 3.6}deg, var(--card-bg) 0deg)`;
    
    const verdictTitle = document.getElementById("verdict-title");
    verdictTitle.innerText = title;
    verdictTitle.style.color = color;

    document.getElementById("recommendation-text").innerText = data.recommendation;
    document.getElementById("verdict-text").innerText = data.final_verdict;

    // 2. Render Facts & Weightages
    const factsContainer = document.getElementById("facts-container");
    factsContainer.innerHTML = "";
    
    data.facts_and_weights.forEach(item => {
        const div = document.createElement("div");
        div.className = "fact-item";
        
        const weightClass = item.weightage < 0 ? "weight-negative" : "weight-positive";
        const weightText = item.weightage > 0 ? `+${item.weightage}` : item.weightage;

        div.innerHTML = `
            <div class="fact-header">
                <strong>${item.fact}</strong>
                <span class="fact-weight ${weightClass}">${weightText} points</span>
            </div>
            <p class="fact-reason">${item.reasoning}</p>
        `;
        factsContainer.appendChild(div);
    });

    // 3. Render Plan of Action
    const planList = document.getElementById("plan-of-action-list");
    planList.innerHTML = "";
    data.plan_of_action.forEach(action => {
        const li = document.createElement("li");
        li.innerText = action;
        planList.appendChild(li);
    });
}
