let isWishlistLoaded = false;

async function loadWishlistHTML() {
    if (isWishlistLoaded) {
        renderWishlist();
        return;
    }

    const section = document.getElementById('wishlist-section');
    if (!section) return;

    try {
        const response = await fetch('wishlist.html');
        const html = await response.text();
        section.innerHTML = html;
        isWishlistLoaded = true;

        const deleteSelBtn = document.getElementById('wish-delete-selected');
        if (deleteSelBtn) {
            deleteSelBtn.addEventListener('click', deleteSelectedWishlist);
        }

        renderWishlist();

    } catch (error) {
        console.error("위시리스트 HTML 로드 실패:", error);
        section.innerHTML = "<p class='text-center py-5'>위시리스트를 불러오는데 실패했습니다.</p>";
    }
}

// 위시리스트 화면
function renderWishlist() {
    const user = JSON.parse(localStorage.getItem('loggedInUser'));
    if (!user) return;

    if (!window.fullProductData || window.fullProductData.length === 0) {
        setTimeout(renderWishlist, 100);
        return;
    }

    const wishlistKey = `wishlist_${user.userid}`;
    let wishlist = JSON.parse(localStorage.getItem(wishlistKey)) || [];

    wishlist = wishlist.map(item => {
        if (item.checked === undefined) item.checked = false;
        return item;
    });

    localStorage.setItem(wishlistKey, JSON.stringify(wishlist));

    const container = document.getElementById('wishlist-container');

    if (!container) return;
    container.innerHTML = '';

    // 상품 상세 정보 + 위시리스트 정보
    let mergedList = wishlist.map(item => {
        const detail = window.fullProductData.find(p => p.productid === item.productid);
        return {
            ...item,
            productgen: detail ? detail.productgen : 'Unknown',
            producttype: item.producttype || (detail ? detail.producttype : [])
        };
    });

    // 카테고리 필터링
    const filterType = document.getElementById('wish-filter-type').value;
    const filterGen = document.getElementById('wish-filter-gen').value;

    if (filterType !== 'all') {
        mergedList = mergedList.filter(item => {
            const types = Array.isArray(item.producttype) ? item.producttype : [item.producttype];
            return types.includes(filterType);
        });
    }

    if (filterGen !== 'all') {
        mergedList = mergedList.filter(item => item.productgen == filterGen);
    }

    // 정렬
    const sortValue = document.getElementById('wish-sort').value;
    mergedList.sort((a, b) => {
        switch (sortValue) {
            case 'date_desc': return new Date(b.addedDate || 0) - new Date(a.addedDate || 0);
            case 'date_asc': return new Date(a.addedDate || 0) - new Date(b.addedDate || 0);
            case 'id_asc': return a.productid - b.productid;
            case 'name_asc': return a.productname.localeCompare(b.productname);
            case 'price_desc': return b.productprice - a.productprice;
            case 'price_asc': return a.productprice - b.productprice;
            default: return 0;
        }
    });

    const isAllChecked = mergedList.length > 0 && mergedList.every(item => item.checked);

    // 체크박스
    const headerHtml = `
        <li class="list-group-item py-2 bg-light">
            <div class="row align-items-center w-100 m-0">
                <div class="col-3 col-sm-3 d-flex align-items-center">
                    <div class="form-check d-flex align-items-center mb-0">
                        <input class="form-check-input mt-0" type="checkbox" id="wish-check-all" 
                            ${isAllChecked ? 'checked' : ''}>
                        <label class="form-check-label small ms-2" for="wish-check-all" style="cursor: pointer; white-space: nowrap;">전체 선택</label>
                    </div>
                </div>
            </div>
        </li>
    `;

    if (mergedList.length === 0) {
        container.innerHTML = headerHtml;
        container.insertAdjacentHTML('beforeend', `<li class="list-group-item text-center py-5 text-secondary">조건에 맞는 상품이 없습니다.</li>`);
        
        attachWishlistEventListeners(mergedList);
        return;
    }

    container.insertAdjacentHTML('beforeend', headerHtml);

    // 위시리스트
    mergedList.forEach(item => {
        let types = Array.isArray(item.producttype) ? item.producttype : [item.producttype];
        let typeIconsHtml = '';
        types.forEach(t => {
            typeIconsHtml += `<img src="./images/Type${t}.svg" alt="${t}" style="height: 20px; width:auto; margin-right:2px;">`;
        });

        const paddedId = String(item.productid).padStart(8, '0');

        const html = `
            <li class="list-group-item py-3 position-relative">
                <div class="row align-items-center w-100 m-0">
                    <div class="col-3 col-sm-3 d-flex align-items-center">
                        <div class="me-5">
                            <input class="form-check-input wish-check-item" type="checkbox"
                                data-id="${item.productid}" ${item.checked ? 'checked' : ''}>
                        </div>
                        <a href="ProjectPokemonGoodsShopDetail.html?id=${item.productid}">
                            <img src="./images/${item.productimgthumbnail}" alt="${item.productname}" 
                                class="rounded border" style="width:100px; height:100px; object-fit:cover; cursor: pointer;">
                        </a>
                    </div>
                    <div class="col-3 col-sm-3 ps-3">
                        <div class="fw-bold text-truncate fs-4" style="max-width: 100%;">${item.productname}</div>
                        <div class="small text-secondary mb-1">${paddedId}</div>
                        <div class="d-flex align-items-center">${typeIconsHtml}</div>
                    </div>
                    <div class="col-3 col-sm-3 text-center">
                        <span class="text-danger fw-bold fs-4">¥${item.productprice.toLocaleString()}</span>
                    </div>
                    <div class="col-3 col-sm-3 d-flex justify-content-end align-items-center gap-3">
                        <button class="wishcart btn btn-dark" onclick="addRecommendToCart(${item.productid})"
                            style="font-size: 0.9rem; white-space: nowrap; padding: 8px 16px;">장바구니</button>
                        <button type="button" class="btn-close wish-delete-item" 
                            data-id="${item.productid}" aria-label="Delete"
                            style="font-size: 1.1rem;"></button>
                    </div>
                </div>
            </li>
        `;
        container.insertAdjacentHTML('beforeend', html);
    });

    attachWishlistEventListeners(mergedList);
}

// 체크박스
function attachWishlistEventListeners(currentList) {
    const user = JSON.parse(localStorage.getItem('loggedInUser'));
    const wishlistKey = `wishlist_${user.userid}`;

    // 전체 선택
    const checkAllBtn = document.getElementById('wish-check-all');
    if (checkAllBtn) {
        checkAllBtn.addEventListener('change', (e) => {
            const isChecked = e.target.checked;
            
            currentList.forEach(item => item.checked = isChecked);

            updateLocalStorageChecked(currentList, user);
            
            renderWishlist();
        });
    }

    // 개별 선택
    document.querySelectorAll('.wish-check-item').forEach(chk => {
        chk.addEventListener('change', (e) => {
            const id = Number(e.target.dataset.id);
            const item = currentList.find(p => p.productid === id);
            
            if (item) {
                item.checked = e.target.checked;
                updateLocalStorageChecked([item], user);
                renderWishlist();
            }
        });
    });

    // 개별 삭제
    document.querySelectorAll('.wish-delete-item').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const id = Number(e.target.dataset.id);
            deleteOneWishlist(id);
        });
    });
}

// 체크박스
function updateLocalStorageChecked(itemsToUpdate, user) {
    const wishlistKey = `wishlist_${user.userid}`;
    let fullWishlist = JSON.parse(localStorage.getItem(wishlistKey)) || [];
    
    const updates = new Map(itemsToUpdate.map(i => [i.productid, i.checked]));
    
    fullWishlist.forEach(item => {
        if (updates.has(item.productid)) {
            item.checked = updates.get(item.productid);
        }
    });
    
    localStorage.setItem(wishlistKey, JSON.stringify(fullWishlist));
}

// 개별 삭제
function deleteOneWishlist(productId) {
    if (!confirm("이 상품을 위시리스트에서 삭제하시겠습니까?")) return;

    const user = JSON.parse(localStorage.getItem('loggedInUser'));
    const wishlistKey = `wishlist_${user.userid}`;
    let wishlist = JSON.parse(localStorage.getItem(wishlistKey)) || [];

    wishlist = wishlist.filter(item => item.productid != productId);
    localStorage.setItem(wishlistKey, JSON.stringify(wishlist));

    renderWishlist();
    if (window.updateHeaderCount) window.updateHeaderCount();
}

// 선택 삭제
function deleteSelectedWishlist() {
    const checkboxes = document.querySelectorAll('.wish-check-item:checked');
    if (checkboxes.length === 0) {
        alert("삭제할 상품을 선택해주세요.");
        return;
    }

    if (!confirm(`선택한 ${checkboxes.length}개 상품을 삭제하시겠습니까?`)) return;

    const user = JSON.parse(localStorage.getItem('loggedInUser'));
    const wishlistKey = `wishlist_${user.userid}`;
    let wishlist = JSON.parse(localStorage.getItem(wishlistKey)) || [];

    const checkedIds = Array.from(checkboxes).map(chk => Number(chk.value));
    
    wishlist = wishlist.filter(item => !checkedIds.includes(Number(item.productid)));
    
    localStorage.setItem(wishlistKey, JSON.stringify(wishlist));

    renderWishlist();
}