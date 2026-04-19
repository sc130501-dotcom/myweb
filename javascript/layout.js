function renderProducts(page) {
    const container = document.getElementById('productlist');
    if (!container) return;

    container.innerHTML = '';

    const startIndex = (page - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const pageData = products.slice(startIndex, endIndex);

    // 데이터가 없을 경우
    if (pageData.length === 0) {
        container.innerHTML = '<p>상품이 없습니다.</p>';
        return;
    }

    // 위시리스트 기능 위해 로그인 정보 가져오기
    const loggedInUserStr = localStorage.getItem('loggedInUser');
    const user = loggedInUserStr ? JSON.parse(loggedInUserStr) : null;
    let wishlist = [];

    if (user) {
        const wishlistKey = `wishlist_${user.userid}`;
        wishlist = JSON.parse(localStorage.getItem(wishlistKey)) || [];
    }

    pageData.forEach(product => {
        // 상품 코드
        const paddedId = String(product.productid).padStart(8, '0');

        // 타입 아이콘
        let types = Array.isArray(product.producttype) ? product.producttype : [product.producttype];
        let typeIconsHtml = '';
        types.forEach(type => {
            typeIconsHtml += `<img src="./images/Type${type}.svg" alt="${type}" class="card-type-icon-img">`;
        });

        // 위시리스트(하트)
        const isWished = wishlist.some(item => item.productid === product.productid);
        const heartImg = isWished ? './images/hearticon_full.png' : './images/hearticon.png';

        // 템플릿
        let template = `
        <div class="col-lg-3 col-md-4 col-sm-6 mb-4">
            <div class="card h-100 product-card" onclick="goToDetail(${product.productid})">
            <div class="product-code-badge">${paddedId}</div>
            <button type="button" class="wishlist-btn" onclick="toggleWishlist(event, ${product.productid})">
                <img src="${heartImg}" alt="위시리스트" class="wishlist-icon" id="heart-${product.productid}">
            </button>
                <div class="card-image d-flex align-items-center justify-content-center" style="padding: 20px; cursor: pointer; height: 220px; background-color: #f8f9fa;">
                    <img src="./images/${product.productimgthumbnail}"
                        alt="${product.productname}" class="card-img-top" style="height: 180px; object-fit: contain;">
                </div>
                <div class="card-body">
                    <h5 class="card-title">${product.productname}</h5>
                    <div class="d-flex justify-content-between align-items-center">
                        <div class="card-typeicons">${typeIconsHtml}</div>
                        <p class="card-text">¥${product.productprice.toLocaleString()}</p>
                    </div>
                </div>
            </div>
        </div>
        `;
        container.insertAdjacentHTML('beforeend', template);
    });

    if (typeof updatePaginationButtons === 'function') {
        updatePaginationButtons();
    }
}

// 상세 페이지 이동
function goToDetail(id) {
    localStorage.setItem('selectedProductId', id);
    location.href = `./ProjectPokemonGoodsShopDetail.html?id=${id}`;
}

// 위시리스트
function toggleWishlist(event, productId) {
    event.stopPropagation();

    // 로그인 확인
    const loggedInUserStr = localStorage.getItem('loggedInUser');
    if (!loggedInUserStr) {
        alert("로그인이 필요한 서비스입니다.");
        const loginModalEl = document.getElementById('loginModal');
        if (loginModalEl) {
            const loginModal = new bootstrap.Modal(loginModalEl);
            loginModal.show();
        }
        return;
    }

    const user = JSON.parse(loggedInUserStr);
    const wishlistKey = `wishlist_${user.userid}`;
    let wishlist = JSON.parse(localStorage.getItem(wishlistKey)) || [];

    const existingIndex = wishlist.findIndex(item => item.productid === productId);
    const heartIcon = document.getElementById(`heart-${productId}`);

    const product = window.allProducts.find(p => p.productid == productId);
    if (!product) return;

    if (existingIndex !== -1) {
        wishlist.splice(existingIndex, 1);
        if (heartIcon) heartIcon.src = './images/hearticon.png';
    } else {
        wishlist.push({
            productid: product.productid,
            productname: product.productname,
            productprice: product.productprice,
            productimgthumbnail: product.productimgthumbnail,
            producttype: product.producttype,
            addedDate: new Date().toISOString()
        });
        if (heartIcon) heartIcon.src = './images/hearticon_full.png';
    }

    localStorage.setItem(wishlistKey, JSON.stringify(wishlist));
}