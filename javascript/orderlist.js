let isOrderlistLoaded = false;

async function loadOrderlistHTML() {
    if (isOrderlistLoaded) {
        renderOrderlist();
        return;
    }

    const section = document.getElementById('orderlist-section');
    if (!section) return;

    try {
        const response = await fetch('orderlist.html');
        const html = await response.text();
        section.innerHTML = html;
        isOrderlistLoaded = true;

        renderOrderlist();

    } catch (error) {
        console.error("주문내역 HTML 로드 실패:", error);
        section.innerHTML = "<p class='text-center py-5'>주문내역을 불러오는데 실패했습니다.</p>";
    }
}

// 주문내역 화면
async function renderOrderlist() {
    const user = JSON.parse(localStorage.getItem('loggedInUser'));
    if (!user) return;

    const container = document.getElementById('orderlist-container');
    const countBadge = document.getElementById('order-count-badge');

    if (!container) return;

    try {
        const [orderorder, productproduct] = await Promise.all([
            fetch('order.json'),
            fetch('products.json')
        ]);

        const orderData = await orderorder.json();
        const productData = await productproduct.json();

        let myOrders = orderData.order.filter(o => o.userid === user.userid);

        // 최근 날짜 순서대로
        myOrders.sort((a, b) => b.orderdate.localeCompare(a.orderdate));

        if (countBadge) countBadge.textContent = `${myOrders.length}건`;
        container.innerHTML = '';

        // 주문내역이 없을 경우
        if (myOrders.length === 0) {
            container.innerHTML = `<li class="list-group-item text-center py-5 text-secondary">주문 내역이 없습니다.</li>`;
            return;
        }

        myOrders.forEach(item => {
            // 날짜 형식
            const dateStr = item.orderdate || "";
            const formattedDate = dateStr.length === 8
                ? dateStr.replace(/(\d{4})(\d{2})(\d{2})/, '$1.$2.$3')
                : dateStr;

            let productsHtml = '';

            const rawProducts = item.orderproducts || item.orderproduct || [];
            const productList = Array.isArray(rawProducts) ? rawProducts : [rawProducts];

            // 상품 정보 찾기
            productList.forEach(prodName => {
                const productDetail = productData.products.find(p => p.productname === prodName);
                const price = productDetail ? productDetail.productprice : 0;
                const img = productDetail ? productDetail.productimgthumbnail : 'monsterball.webp';

                productsHtml += `
                    <div class="d-flex align-items-center mb-2">
                        <img src="./images/${img}" onerror="this.src='./images/monsterball.webp'" 
                             class="rounded border me-3" style="width:60px; height:60px; object-fit:cover; margin-left:60px;">
                        <div class="text-start">
                            <div class="fw-bold text-truncate" style="max-width: 200px; margin-left:10px;">${prodName}</div>
                            <div class="small text-danger" style="margin-left:10px;">¥${price.toLocaleString()}</div>
                        </div>
                    </div>
                `;
            });

            const status = item.status || '배송완료';

            const html = `
                <li class="list-group-item py-3">
                    <div class="row w-100 m-0">
                        <div class="col-2 text-center small d-flex flex-column justify-content-center">
                            <div class="fw-bold">${formattedDate}</div>
                            <div class="text-secondary text-truncate" title="${item.orderid}">
                                ORD-${item.orderid}
                            </div>
                        </div>
                        <div class="col-5 ps-3 d-flex flex-column justify-content-center">
                            ${productsHtml}
                        </div>
                        <div class="col-2 text-center d-flex flex-column justify-content-center">
                            <span class="badge bg-success">${status}</span>
                        </div>
                        <div class="col-3 text-center d-flex flex-column justify-content-center align-items-center">
                            <button class="btn btn-sm btn-outline-dark mb-1 w-75">구매확정</button>
                            <button class="btn btn-sm btn-outline-secondary w-75">교환/반품</button>
                        </div>
                    </div>
                </li>
            `;
            container.insertAdjacentHTML('beforeend', html);
        });
    } catch (error) {
        console.error("데이터 로드 실패:", error);
        container.innerHTML = `<li class="list-group-item text-center py-5 text-danger">데이터를 불러오지 못했습니다.</li>`;
    }

    // 기간 필터링
}