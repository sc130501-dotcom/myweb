let currentProduct = null;
let currentAmount = 1;

// 최소수량 최대수량
const minamount = 1;
const maxamount = 10;

document.addEventListener("DOMContentLoaded", function () {
    const urlParams = new URLSearchParams(window.location.search);
    let productId = urlParams.get('id');

    if (!productId) {
        productId = localStorage.getItem('selectedProductId');
    }

    if (!productId) {
        alert("상품 정보가 없습니다.");
        location.href = "./ProjectPokemonGoodsShop.html";
        return;
    }

    fetch('products.json')
        .then(response => response.json())
        .then(data => {
            currentProduct = data.products.find(p => p.productid == productId);

            if (!currentProduct) {
                alert("존재하지 않는 상품입니다.");
                location.href = "./ProjectPokemonGoodsShop.html";
                return;
            }
            renderDetail();
        })
        .catch(error => {
            console.error('Error:', error);
            alert("상품 정보를 불러오는 데 실패했습니다.");
        });

    // 수량 입력
    const amountInput = document.getElementById('amountInput');
    if (amountInput) {
        amountInput.addEventListener('input', function () {
            let val = this.value.replace(/[^0-9]/g, '');
            if (val.length > 2) {
                val = val.slice(0, 2);
            }

            this.value = val;
        });

        amountInput.addEventListener('change', function () {
            let val = this.value === "" ? 1 : parseInt(this.value);
            updateAmount(val);
        });
    }

    // 장바구니
    const cartBtn = document.querySelector('.cart');
    if (cartBtn) {
        cartBtn.addEventListener('click', addToCart);
    }
});

function addToCart() {
    if (!currentProduct) return;

    const loggedInUser = localStorage.getItem('loggedInUser');
    if (!loggedInUser) {
        alert("로그인이 필요한 서비스입니다.");
        const loginModalEl = new bootstrap.Modal(document.getElementById('loginModal'));
        if(loginModalEl) {
            const loginModal = new bootstrap.Modal(loginModalEl);
            loginModal.show();
        }
        return;
    }

    const user = JSON.parse(loggedInUser);
    const userId = user.userid;

    // 사용자별 장바구니
    const cartKey = `cart_${userId}`;

    // 기존 장바구니 불러오기
    let cartList = JSON.parse(localStorage.getItem(cartKey)) || [];

    // 기존 장바구니와 상품 중복 여부 확인
    const existingItemIndex = cartList.findIndex(item => item.productid === currentProduct.productid);

    let msg = "";

    if (existingItemIndex !== -1) {
        // 추가하려는 상품이 이미 장바구니에 있을 경우
        const currentCartAmount = cartList[existingItemIndex].amount;
        let newAmount = currentCartAmount + currentAmount;

        // (기존 장바구니에 담겨있는 상품 수량 + 추가하려는 상품 수량)이 10을 넘을 경우
        if (newAmount > 10) {
            newAmount = 10;
            msg = `${currentProduct.productname}(이)가 한도 초과로 인해 최대 수량(10개)으로 조정되어 장바구니에 담겼습니다.`;
        } else {
            // 일반적인 경우
            msg = `${currentProduct.productname}(이)가 이미 장바구니에 담겨 있습니다. ${currentAmount}개 추가`;
        }
        cartList[existingItemIndex].amount = newAmount;

    } else {
        if (currentAmount > 10) currentAmount = 10;

        // 추가하려는 상품이 장바구니에 없는 경우
        const newItem = {
            productid: currentProduct.productid,
            productname: currentProduct.productname,
            productprice: currentProduct.productprice,
            productimgthumbnail: currentProduct.productimgthumbnail,
            amount: currentAmount,
            checked: true
        };

        cartList.push(newItem);

        msg = `${currentProduct.productname}이(가) 장바구니에 담겼습니다.`;
    }
    // 데이터 저장
    localStorage.setItem(cartKey, JSON.stringify(cartList));

    if (window.showCartToast) window.showCartToast(msg);
    if (window.openCart) window.openCart(); 
    if (window.refreshCartUI) window.refreshCartUI();
    if (window.updateHeaderCount) window.updateHeaderCount();
    if (window.showRecommendToast) window.showRecommendToast();
}

// 수량 변경
function updateAmount(newVal) {
    const amountInput = document.getElementById('amountInput');
    if (!amountInput) return;

    if (isNaN(newVal)) newVal = minamount;

    if (newVal < minamount) {
        newVal = minamount;
    }
    else if (newVal > maxamount) {
        alert(`최대 주문 수량은 ${maxamount}개입니다.`);
        newVal = maxamount;
    }

    amountInput.value = newVal;
    currentAmount = newVal;
    updateTotalPrice();
}


function changeamount(diff) {
    updateAmount(currentAmount + diff);
}

function renderDetail() {
    if (!currentProduct) return;

    setText('productname', currentProduct.productname);
    setText('productid', `${String(currentProduct.productid).padStart(8, '0')}`);
    setText('productprice', `¥${currentProduct.productprice.toLocaleString()}`);

    setImage('productimgthumbnail', currentProduct);
    setImage('productimgdetail', currentProduct);

    setTypeIcons(currentProduct);

    WishlistIcon();

    updateTotalPrice();
}

// 위시리스트 눌렀을 때
function Wishlist() {
    const loggedInUserStr = localStorage.getItem('loggedInUser');
    if (!loggedInUserStr) {
        alert("로그인이 필요한 서비스입니다.");
        const loginModalEl = document.getElementById('loginModal');
        if(loginModalEl) {
            const loginModal = new bootstrap.Modal(loginModalEl);
            loginModal.show();
        }
        return;
    }

    const user = JSON.parse(loggedInUserStr);
    const wishlistKey = `wishlist_${user.userid}`;
    let wishlist = JSON.parse(localStorage.getItem(wishlistKey)) || [];

    const existingIndex = wishlist.findIndex(item => item.productid === currentProduct.productid);
    const wishIcon = document.getElementById('wish-icon');

    let wishmessage = "";

    if (existingIndex !== -1) {
        wishlist.splice(existingIndex, 1);
        if (wishIcon) wishIcon.src = './images/hearticon.png';
        wishmessage = `${currentProduct.productname}(이)가 위시리스트에서 삭제되었습니다.`;
    } else {
        wishlist.push({
            productid: currentProduct.productid,
            productname: currentProduct.productname,
            productprice: currentProduct.productprice,
            productimgthumbnail: currentProduct.productimgthumbnail,
            producttype: currentProduct.producttype,
            addedDate: new Date().toISOString()
        });

        if (wishIcon) wishIcon.src = './images/hearticon_full.png';
        wishmessage = `${currentProduct.productname}(이)가 위시리스트에 추가되었습니다.`;
    }

    localStorage.setItem(wishlistKey, JSON.stringify(wishlist));

    if (window.showWishlistToast) window.showWishlistToast(wishmessage);
    if (window.updateHeaderCount) window.updateHeaderCount();

}

// 위시리스트 아이콘
function WishlistIcon() {
    const loggedInUserStr = localStorage.getItem('loggedInUser');
    if (!loggedInUserStr) return;

    const user = JSON.parse(loggedInUserStr);
    const wishlistKey = `wishlist_${user.userid}`;
    let wishlist = JSON.parse(localStorage.getItem(wishlistKey)) || [];

    const isWished = wishlist.some(item => item.productid === currentProduct.productid);
    const wishIcon = document.getElementById('wish-icon');

    if (wishIcon) {
        wishIcon.src = isWished ? './images/hearticon_full.png' : './images/hearticon.png';
    }
}

function setText(id, text) {
    const el = document.getElementById(id);
    if (el) el.textContent = text;
}


function setImage(id, product) {
    const el = document.getElementById(id);
    if (el) {
        el.src = `./images/${product.productimgthumbnail}`;
        el.alt = product.productname;
    }
}

function setTypeIcons(product) {
    const container = document.getElementById('producttypeicon');
    if (!container) return;

    container.innerHTML = '';

    // 타입 배열로 변환
    const types = Array.isArray(product.producttype) ? product.producttype : [product.producttype];

    types.forEach(type => {
        const img = document.createElement('img');
        img.src = `./images/Type${type}.svg`;
        img.alt = type;
        img.style.width = '30px';
        img.style.height = 'auto';

        container.appendChild(img);
    });
}

// 총 가격
function updateTotalPrice() {
    if (!currentProduct) return;

    const total = currentProduct.productprice * currentAmount;

    // 배송비(기본 ¥400, ¥7,000 이상 주문 시 무료)
    const shippingEl = document.getElementById('shippingfee');
    if (shippingEl) {
        shippingEl.innerHTML = `¥400
            <span style="font-weight: normal; font-size: 0.95rem;">(¥7,000 이상 주문 시 무료배송)</span>`;
    }

    setText('totalprice', `¥${total.toLocaleString()}`);
}


