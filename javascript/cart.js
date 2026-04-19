// 장바구니 초기화 및 렌더링
function initCart(user) {
    if (!user || !user.userid) return;

    const cartKey = `cart_${user.userid}`;

    // 토스트 순서(추천-장바구니-위시리스트)
    let container = document.querySelector('.toast-container');
    if (!container) {
        container = document.createElement('div');
        container.className = 'toast-container position-fixed bottom-0 start-0 p-3';
        container.style.zIndex = '1055';
        container.innerHTML = `
            <div id="toast-slot-recommend"></div>
            <div id="toast-slot-cart"></div>
            <div id="toast-slot-wishlist"></div>
        `;
        document.body.appendChild(container);
    }


    window.refreshCartUI = () => {
        renderCartContent();
    };

    window.updateHeaderCount = () => {
        const user = JSON.parse(localStorage.getItem('loggedInUser'));
        if (!user) return;

        // 장바구니 배지 갱신
        const cList = JSON.parse(localStorage.getItem(`cart_${user.userid}`)) || [];
        const cEl = document.getElementById('cart-count');
        if (cEl) {
            cEl.textContent = cList.length;
            cEl.style.display = cList.length > 0 ? 'inline-block' : 'none';
        }

        // 위시리스트 배지 갱신
        const wList = JSON.parse(localStorage.getItem(`wishlist_${user.userid}`)) || [];
        const wEl = document.getElementById('wish-count');
        if (wEl) {
            wEl.textContent = wList.length;
            wEl.style.display = wList.length > 0 ? 'inline-block' : 'none';
        }
    };

    // 장바구니 토스트
    window.showCartToast = (message) => {
        if (!message) return;

        const cartToastHtml = `
            <div id="cartToast" class="toast" role="alert" aria-live="assertive" aria-atomic="true" data-bs-delay="3000">
                <div class="toast-header">
                  <img src="./images/monsterball.webp" class="rounded me-2" alt="..." style="width: 20px;">
                  <strong class="me-auto">알림</strong>
                  <button type="button" class="btn-close" data-bs-dismiss="toast" aria-label="Close"></button>
                </div>
                <div class="toast-body">
                  ${message}
                </div>
            </div>
        `;

        const slot = document.getElementById('toast-slot-cart');
        if (slot) {
            slot.insertAdjacentHTML('beforeend', cartToastHtml);
            const toastEl = slot.lastElementChild;
            const toast = new bootstrap.Toast(toastEl);
            toast.show();
            toastEl.addEventListener('hidden.bs.toast', () => toastEl.remove());
        }
    }

    // 위시리스트 토스트
    window.showWishlistToast = (message) => {
        if (!message) return;

        const wishToastHtml = `
        <div id="wishToast" class="toast" role="alert" aria-live="assertive" aria-atomic="true" data-bs-delay="3000">
            <div class="toast-header">
                <img src="./images/monsterball.webp" class="rounded me-2" alt="..." style="width: 20px;">
                <strong class="me-auto">알림</strong>
                <button type="button" class="btn-close" data-bs-dismiss="toast" aria-label="Close"></button>
            </div>
            <div class="toast-body">
                ${message}
            </div>
        </div>
    `;

        const slot = document.getElementById('toast-slot-wishlist');
        if (slot) {
            slot.insertAdjacentHTML('beforeend', wishToastHtml);
            const toastEl = slot.lastElementChild;
            const toast = new bootstrap.Toast(toastEl);
            toast.show();
            toastEl.addEventListener('hidden.bs.toast', () => toastEl.remove());
        }
    }

    // 장바구니 열기
    window.openCart = () => {
        const tryOpen = () => {
            const offcanvasEl = document.getElementById('offcanvasRight');
            if (offcanvasEl && typeof bootstrap !== 'undefined') {
                const bsOffcanvas = bootstrap.Offcanvas.getInstance(offcanvasEl) || new bootstrap.Offcanvas(offcanvasEl);
                bsOffcanvas.show();
            } else {
                setTimeout(tryOpen, 100);
            }
        };
        tryOpen();
    };


    // 장바구니 화면 그리기 함수
    const renderCartContent = () => {
        const listContainer = document.getElementById('cart-list-container');
        const footerContainer = document.getElementById('cart-footer-container');
        const badgeArea = document.getElementById('cart-badge-area');

        if (!listContainer || !footerContainer || !badgeArea) return;

        let cartList = JSON.parse(localStorage.getItem(cartKey)) || [];

        cartList = cartList.map(item => {
            if (item.checked === undefined) item.checked = true;
            return item;
        });

        // 요소가 없으면 종료
        if (!listContainer || !footerContainer || !badgeArea) return;

        // 뱃지 업데이트
        if (cartList.length > 0) {
            badgeArea.innerHTML = `<span class="badge bg-danger rounded-pill position-absolute" style="top:5px; right:5px;">${cartList.length}</span>`;
        } else {
            badgeArea.innerHTML = '';
        }

        // 목록 HTML 생성
        let cartItemsHtml = '';
        let totalProductPrice = 0; // 체크된 상품 총 금액
        let isAllChecked = cartList.length > 0 && cartList.every(item => item.checked);

        if (cartList.length === 0) {
            cartItemsHtml = `<li class="list-group-item py-3 text-center">장바구니가 비어있습니다.</li>`;
        } else {
            // 상품 선택 체크박스
            cartItemsHtml += `
                <li class="list-group-item py-2 bg-light d-flex justify-content-between align-items-center">
                    <div class="form-check d-flex align-items-center mb-0">
                        <input class="form-check-input mt-0" type="checkbox" id="check-all" ${isAllChecked ? 'checked' : ''}>
                        <label class="form-check-label small ms-2" for="check-all" style="cursor: pointer;">전체 선택</label>
                    </div>
                    <button type="button" class="btn btn-sm btn-outline-secondary" id="delete-selected-btn">선택 삭제</button>
                </li>
                `;

            cartList.forEach(item => {
                // 체크된 상품만 가격 합산
                const itemTotal = item.productprice * item.amount;
                if (item.checked) {
                    totalProductPrice += itemTotal;
                }

                // 상품 리스트
                cartItemsHtml += `
                    <li class="list-group-item py-3 position-relative">
                        <button type="button" class="btn-close position-absolute top-0 end-0 m-2 cart-delete"
                            data-id="${item.productid}" aria-label="Delete" style="font-size: 0.75rem; z-index: 10;"></button>
                        <div class="row align-items-center w-100 m-0">
                            <div class="col-4 d-flex align-items-center ps-0">
                                <div class="me-4">
                                    <input class="form-check-input cart-check-item" type="checkbox"
                                        data-id="${item.productid}" ${item.checked ? 'checked' : ''}>
                                </div>
                                <a href="ProjectPokemonGoodsShopDetail.html?id=${item.productid}">
                                        <img src="./images/${item.productimgthumbnail}" alt="${item.productname}"
                                        class="cart-thumb rounded border" style="width:50px; height:50px; object-fit:cover; cursor: pointer;">
                                </a>
                            </div>
                            <div class="col-4 text-center d-flex flex-column align-items-center justify-content-center">
                                <div class="mb-2 fw-bold text-truncate"
                                    style="max-width: 100%;">${item.productname}</div>
                                <div class="input-group input-group-sm flex-nowrap justify-content-center" style="width: 100%;">
                                    <button class="btn btn-outline-secondary btn-sm cart-decrease"
                                        type="button" data-id="${item.productid}">-</button>
                                    <input type="text" class="form-control text-center cart-amount-input p-0"
                                        value="${item.amount}" data-id="${item.productid}" maxlength="2">
                                    <button class="btn btn-outline-secondary btn-sm cart-increase"
                                        type="button" data-id="${item.productid}">+</button>
                                </div>
                            </div>
                            <div class="col-4 text-end">
                                <span class="text-danger fw-bold fs-5">¥${itemTotal.toLocaleString()}</span>
                            </div>
                        </div>
                    </li>
                `;
            });
        }

        // 장바구니 금액 계산
        listContainer.innerHTML = cartItemsHtml;

        // 배송비 및 총액 계산
        let shippingFee = 0;

        if (totalProductPrice > 0) {
            // 배송비(기본 ¥400, 체크된 상품 ¥7,000 이상 주문 시 무료)
            shippingFee = totalProductPrice >= 7000 ? 0 : 400;
        }
        const finalPrice = totalProductPrice + shippingFee;

        // 결제 정보
        footerContainer.innerHTML = `
            <div class="d-flex justify-content-between mb-1">
                <span class="text-secondary">선택 상품 금액</span>
                <span>¥${totalProductPrice.toLocaleString()}</span>
            </div>
            <div class="d-flex justify-content-between mb-3 align-items-center">
                <span class="text-secondary" style="font-size: 0.9rem;">+ 배송비</span>
                <span>¥${shippingFee}</span>
            </div>
            <div class="d-flex justify-content-between mb-3 align-items-center border-top pt-2">
                <span class="fw-bold">총 결제금액</span>
                <span class="fw-bold text-danger fs-5">¥${finalPrice.toLocaleString()}</span>
            </div>
            <button type="button" class="btn btn-primary w-100 py-2 fw-bold buynow-btn" onclick="alert('구매 페이지로 이동합니다.')">구매하기</button>
        `;

        attachCartEventListeners(cartList);
    };

    // 장바구니 내부
    const attachCartEventListeners = (currentList) => {

        // 전체 선택 체크박스
        const checkAllBtn = document.getElementById('check-all');
        if (checkAllBtn) {
            checkAllBtn.addEventListener('change', (e) => {
                const isChecked = e.target.checked;
                currentList.forEach(item => item.checked = isChecked);
                localStorage.setItem(cartKey, JSON.stringify(currentList));
                renderCartContent();
            });
        }

        // 개별 선택 체크박스
        document.querySelectorAll('.cart-check-item').forEach(chk => {
            chk.addEventListener('change', (e) => {
                const id = e.target.dataset.id;
                const itemIndex = currentList.findIndex(p => p.productid == id);
                if (itemIndex !== -1) {
                    currentList[itemIndex].checked = e.target.checked;
                    localStorage.setItem(cartKey, JSON.stringify(currentList));
                    renderCartContent();
                }
            });
        });

        // 수량 업데이트 및 저장
        const updateCartAmount = (productId, newAmount) => {
            if (newAmount < 1) newAmount = 1;
            if (newAmount > 10) {
                alert("최대 10개까지만 담을 수 있습니다.");
                newAmount = 10;
            }

            const itemIndex = currentList.findIndex(p => p.productid == productId);
            if (itemIndex !== -1) {
                currentList[itemIndex].amount = newAmount;
                localStorage.setItem(cartKey, JSON.stringify(currentList));

                renderCartContent();
            }
        };

        // 개별 삭제
        document.querySelectorAll('.cart-delete').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = e.target.dataset.id;
                if (confirm("해당 상품을 장바구니에서 삭제하시겠습니까?")) {
                    const updatedList = currentList.filter(p => p.productid != id);
                    localStorage.setItem(cartKey, JSON.stringify(updatedList));
                    renderCartContent();
                }
            });
        });

        // 선택 삭제
        const deleteSelectedBtn = document.getElementById('delete-selected-btn');
        if (deleteSelectedBtn) {
            deleteSelectedBtn.addEventListener('click', () => {
                const selectedItems = currentList.filter(item => item.checked);

                if (confirm(`선택한 상품을 삭제하시겠습니까?`)) {
                    if (selectedItems.length === 0) {
                        alert("삭제할 상품을 선택해주세요.");
                        return;
                    } else {
                        const newCartList = currentList.filter(item => !item.checked);
                        localStorage.setItem(cartKey, JSON.stringify(newCartList));
                        renderCartContent();
                    }
                }
            });
        }

        // (-)
        document.querySelectorAll('.cart-decrease').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = e.target.dataset.id;
                const input = e.target.parentElement.querySelector('input');
                updateCartAmount(id, parseInt(input.value) - 1);
            });
        });

        // (+)
        document.querySelectorAll('.cart-increase').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = e.target.dataset.id;
                const input = e.target.parentElement.querySelector('input');
                updateCartAmount(id, parseInt(input.value) + 1);
            });
        });

        // input
        document.querySelectorAll('.cart-amount-input').forEach(input => {
            input.addEventListener('input', function () {
                this.value = this.value.replace(/[^0-9]/g, '');
            });
            input.addEventListener('change', (e) => {
                const id = e.target.dataset.id;
                let val = parseInt(e.target.value);
                if (isNaN(val)) val = 1;
                updateCartAmount(id, val);
            });
        });
    }

    // 장바구니 내용 채우기 (최초 실행)
    const waitForHeader = () => {
        const listContainer = document.getElementById('cart-list-container');
        if (listContainer) {
            renderCartContent();
        } else {
            setTimeout(waitForHeader, 100);
        }
    };
    waitForHeader();

    // 장바구니 자동으로 보여주기
    CartNotifications();
}

// 장바구니 열림 + 장바구니 자동으로 보여주기
async function CartNotifications() {
    // 추천상품 토스트 알림
    window.showRecommendToast = async () => {
        try {
            const response = await fetch('products.json')
            const data = await response.json();
            // ¥2,500 이상 상품만 랜덤으로 3개
            let candidates = data.products.filter(p => p.productprice >= 2500)

            let randomProducts = [];
            for (let i = 0; i < 3; i++) {
                if (candidates.length === 0) break;
                const idx = Math.floor(Math.random() * candidates.length);
                randomProducts.push(candidates[idx]);
                candidates.splice(idx, 1);
            }

            if (randomProducts.length > 0) {
                let productsHtml = '';
                randomProducts.forEach(p => {
                    productsHtml += `
                        <div class="col-4 px-1">
                            <div class="border rounded p-2 bg-white h-100 d-flex flex-column align-items-center justify-content-between">
                                <a href="ProjectPokemonGoodsShopDetail.html?id=${p.productid}" class="d-block mb-2">
                                    <img src="./images/${p.productimgthumbnail}" class="img-fluid rounded"
                                        alt="${p.productname}" style="width: 100%; aspect-ratio: 1/1; object-fit: contain;">
                                </a>
                                <div class="w-100 text-center text-truncate fw-bold mb-1" style="font-size: 0.8rem;">${p.productname}</div>
                                <button class="btn btn-sm btn-outline-dark w-100 p-0"
                                    style="font-size: 0.75rem; height: 30px;"
                                    onclick="addRecommendToCart(${p.productid})">장바구니에 추가</button>
                            </div>
                        </div>
                    `;
                });

                const recommendToastHtml = `
                    <div id="recommendToast" class="toast" role="alert" aria-live="assertive" aria-atomic="true" data-bs-autohide="false">
                        <div class="toast-header border-bottom-0">
                            <img src="./images/monsterball.webp" class="rounded me-2" alt="..." style="width: 20px;">
                            <strong class="me-auto">추천상품</strong>
                            <button type="button" class="btn-close" data-bs-dismiss="toast" aria-label="Close"></button>
                        </div>
                        <div class="toast-body pt-0" style="margin-top: 10px;">
                             <div class="row gx-2">
                                ${productsHtml}
                             </div>
                        </div>
                    </div>
                `;

                const slot = document.getElementById('toast-slot-recommend');
                if (slot) {
                    slot.innerHTML = recommendToastHtml;
                    const toastEl = slot.firstElementChild;
                    const toast = new bootstrap.Toast(toastEl);
                    toast.show();
                }
            }
        } catch (e) {
            console.error("추천 상품 로드 실패: ", e)
        }
    }

    const cartAction = localStorage.getItem('cartAction');
    const cartMessage = localStorage.getItem('cartMessage');
    const recommendMessage = localStorage.getItem('recommendMessage');
    const wishMessage = localStorage.getItem('wishMessage');

    if (cartAction === 'open') {
        localStorage.removeItem('cartAction');
        if (window.openCart) window.openCart();
    }

    if (recommendMessage) {
        localStorage.removeItem('recommendMessage');
        if (window.showRecommendToast) window.showRecommendToast();
    }

    if (cartMessage) {
        localStorage.removeItem('cartMessage');
        if (window.showCartToast) window.showCartToast(cartMessage);
    }

    if (wishMessage) {
        localStorage.removeItem('wishMessage');
        if (window.showWishlistToast) window.showWishlistToast(wishMessage);
    }
}

// 추천 상품 장바구니에 추가
async function addRecommendToCart(productId) {
    const loggedInUser = localStorage.getItem('loggedInUser');
    if (!loggedInUser) return;

    const user = JSON.parse(loggedInUser);
    const cartKey = `cart_${user.userid}`;

    try {
        const response = await fetch('products.json');
        const data = await response.json();
        const product = data.products.find(p => p.productid == productId);

        if (!product) return;
        let cartList = JSON.parse(localStorage.getItem(cartKey)) || [];
        const existingItemIndex = cartList.findIndex(item => item.productid === product.productid);
        let msg = "";

        if (existingItemIndex !== -1) {
            if (cartList[existingItemIndex].amount < 10) {
                cartList[existingItemIndex].amount += 1;
                msg = `${product.productname} 수량이 추가되었습니다.`;
            } else {
                alert("최대 수량(10개)에 도달했습니다.");
                return;
            }
        } else {
            cartList.push({
                productid: product.productid,
                productname: product.productname,
                productprice: product.productprice,
                productimgthumbnail: product.productimgthumbnail,
                amount: 1,
                checked: true
            });
            msg = `${product.productname}이(가) 장바구니에 담겼습니다.`;
        }

        localStorage.setItem(cartKey, JSON.stringify(cartList));
        
        if (window.showCartToast) window.showCartToast(msg);
        if (window.updateHeaderCount) window.updateHeaderCount();
        if (window.refreshCartUI) window.refreshCartUI();
        if (window.showRecommendToast) window.showRecommendToast();

    } catch (e) {
        console.error("장바구니 추가 오류:", e);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const userStr = localStorage.getItem('loggedInUser');
    if (userStr) {
        const user = JSON.parse(userStr);
        initCart(user);

        const checkHeader = () => {
            if (document.getElementById('cart-count')) {
                if (window.updateHeaderCount) window.updateHeaderCount();
            } else {
                setTimeout(checkHeader, 100);
            }
        }
        checkHeader();
    }
});