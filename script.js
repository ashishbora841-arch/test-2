const menuItems = [
    { id: 1, name: "Masala Chai (Pot)", price: 40 },
    { id: 2, name: "Cold Coffee with Ice Cream", price: 80 },
    { id: 3, name: "Special Vegetable Samosa (2 pcs)", price: 30 },
    { id: 4, name: "Paneer Grilled Sandwich", price: 70 },
    { id: 5, name: "Commerce Fest VIP Combo", price: 120 },
    { id: 6, name: "Gulab Jamun (2 pcs)", price: 40 }
];

function playAudioChime() {
    try {
        const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(587.33, audioCtx.currentTime);
        gain.gain.setValueAtTime(0.2, audioCtx.currentTime);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.3);
    } catch(e) {}
}

function loadDashboard() {
    const orders = JSON.parse(localStorage.getItem("commfest_orders") || "[]");
    const container = document.getElementById("kitchenOrdersList");
    
    // Metrics calculation
    document.getElementById("statPending").innerText = orders.filter(o => o.status !== 'Delivered').length;
    document.getElementById("statTotal").innerText = orders.length;
    document.getElementById("statRevenue").innerText = `₹${orders.reduce((sum, o) => sum + o.total, 0)}`;

    if (orders.length === 0) {
        container.innerHTML = `<div class="bg-gray-800 border border-gray-700 p-8 rounded-2xl text-center text-gray-400">Waiting for incoming staffroom orders...</div>`;
        return;
    }

    container.innerHTML = orders.map(order => `
        <div class="bg-gray-800 border border-gray-700 rounded-2xl p-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow">
            <div>
                <div class="flex items-center gap-3 mb-1">
                    <span class="bg-orange-500/20 text-orange-400 font-bold px-2.5 py-0.5 rounded-lg text-xs">${order.id}</span>
                    <span class="text-xs text-gray-400"><i class="fa-regular fa-clock"></i> ${order.time}</span>
                </div>
                <h3 class="text-lg font-bold text-white">${order.location}</h3>
                <p class="text-sm text-gray-300 mb-2">Teacher: <strong class="text-orange-300">${order.teacherName || 'Staff Member'}</strong></p>
                <div class="bg-gray-900/60 p-3 rounded-xl border border-gray-700 text-sm mb-2">
                    ${order.items.map(i => `<span class="inline-block bg-gray-700 px-2 py-1 rounded-lg text-xs mr-2 mb-1">${i.qty}x${i.name}</span>`).join('')}
                </div>
                ${order.notes ? `<p class="text-xs text-gray-400 italic"><i class="fa-solid fa-note-sticky text-orange-400"></i> "${order.notes}"</p>` : ''}
            </div>
            <div class="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
                <span class="px-3 py-1 rounded-full text-xs font-bold ${
                    order.status === 'Delivered' ? 'bg-green-500/20 text-green-400' :
                    order.status === 'En Route' ? 'bg-blue-500/20 text-blue-400' :
                    order.status === 'Preparing' ? 'bg-orange-500/20 text-orange-400' : 'bg-yellow-500/20 text-yellow-400'
                }">${order.status}</span>
                <div class="flex gap-2 w-full sm:w-auto">
                    ${order.status === 'Received' ? `<button onclick="updateStatus('${order.id}', 'Preparing')" class="flex-1 sm:flex-none bg-yellow-600 hover:bg-yellow-700 px-4 py-2 rounded-xl text-xs font-bold transition">Start Prep</button>` : ''}
                    ${order.status === 'Preparing' ? `<button onclick="updateStatus('${order.id}', 'En Route')" class="flex-1 sm:flex-none bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-xl text-xs font-bold transition">Mark En Route</button>` : ''}
                    ${order.status === 'En Route' ? `<button onclick="updateStatus('${order.id}', 'Delivered')" class="flex-1 sm:flex-none bg-green-600 hover:bg-green-700 px-4 py-2 rounded-xl text-xs font-bold transition">Mark Delivered</button>` : ''}
                </div>
            </div>
        </div>
    `).join('');
}

function updateStatus(orderId, newStatus) {
    let orders = JSON.parse(localStorage.getItem("commfest_orders") || "[]");
    orders = orders.map(o => o.id === orderId ? { ...o, status: newStatus } : o);
    localStorage.setItem("commfest_orders", JSON.stringify(orders));
    loadDashboard();
}

function toggleStockModal() {
    const modal = document.getElementById("stockModal");
    modal.classList.toggle("hidden");
    if (!modal.classList.contains("hidden")) {
        renderStockList();
    }
}

function renderStockList() {
    const list = document.getElementById("stockList");
    const savedStock = JSON.parse(localStorage.getItem("commfest_stock") || "{}");

    list.innerHTML = menuItems.map(item => {
        const inStock = savedStock[item.id] !== undefined ? savedStock[item.id] : true;
        return `
            <div class="flex justify-between items-center bg-gray-900 p-3 rounded-xl border border-gray-700">
                <span class="text-sm font-semibold">${item.name}</span>
                <button onclick="toggleItemStock(${item.id})" class="px-3 py-1 rounded-lg text-xs font-bold ${inStock ? 'bg-green-600 text-white' : 'bg-red-600 text-white'}">
                    ${inStock ? 'In Stock' : 'Sold Out'}
                </button>
            </div>
        `;
    }).join('');
}

function toggleItemStock(id) {
    let savedStock = JSON.parse(localStorage.getItem("commfest_stock") || "{}");
    const current = savedStock[id] !== undefined ? savedStock[id] : true;
    savedStock[id] = !current;
    localStorage.setItem("commfest_stock", JSON.stringify(savedStock));
    renderStockList();
}

window.addEventListener("storage", () => {
    playAudioChime();
    loadDashboard();
});

loadDashboard();