// 로그인 문자 형식 유효성 검사
function initLogin() {
    'use strict'
    const forms = document.querySelectorAll('.login-needs-validation')

    Array.from(forms).forEach(form => {
        form.addEventListener('submit', event => {
            if (!form.checkValidity()) {
                event.preventDefault()
                event.stopPropagation()
            }
            form.classList.add('was-validated')
        }, false)
    })

    const loginid = document.getElementById('login_inputid');
    const loginpw = document.getElementById('login_inputpw');
    const loginengandnumElements = [loginid, loginpw];

    loginengandnumElements.forEach(function (el) {
        if (el) {
            el.addEventListener('input', function () {
                this.value = this.value.replace(/[^a-zA-Z0-9]/g, '');
            });
        }
    });
}

// 로그인
function Login() {
    const loginForm = document.getElementById('login-form');
    if (!loginForm) return;

    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault(); // 새로고침 방지

        if (!loginForm.checkValidity()) return;

        const inputId = document.getElementById('login_inputid').value.trim();
        const inputPw = document.getElementById('login_inputpw').value.trim();
        const USERS_JSON_URL = './account.json';

        try {
            const response = await fetch(USERS_JSON_URL);
            const data = await response.json();
            const jsonUsers = data.accounts;

            const localUsers = JSON.parse(localStorage.getItem('userlist')) || [];
            const allUsers = [...jsonUsers, ...localUsers];

            const user = allUsers.find(u => (u.userid === inputId) && (u.userpw === inputPw));

            if (user) {
                alert(`${user.username} 님 로그인 성공!`);
                localStorage.setItem('loggedInUser', JSON.stringify(user));

                const modalEl = document.getElementById('loginModal');
                const modal = bootstrap.Modal.getInstance(modalEl);
                if (modal) { modal.hide(); }
                else {
                    const closeBtn = modalEl.querySelector('.btn-close');
                    if (closeBtn) closeBtn.click();
                }

                loginForm.reset();
                loginForm.classList.remove('was-validated');
                updateLoginState();
                location.reload();
            } else {
                alert('아이디 또는 비밀번호가 일치하지 않습니다.');
            }
        } catch (error) {
            console.error('오류:', error);
        }
    });
}

// 로그인 상태
function updateLoginState() {
    const loggedInUser = localStorage.getItem('loggedInUser');
    const navList = document.querySelector('.nav.justify-content-end');
    if (!navList) return;

    if (loggedInUser) {
        try {
            const user = JSON.parse(loggedInUser);

            if (user && user.username) {

                // 장바구니 레이아웃
                navList.innerHTML = `
                    <li class="nav-item d-flex align-items-center">
                        <span class="me-2" style="font-weight:bold; color:#fff;">${user.username} 님</span>
                    </li>
                    <li class="nav-item">
                        <button type="button" class="btn" id="mypage-btn">마이페이지</button>
                    </li>
                    <li class="nav-item">
                        <button type="button" class="btn" id="logout-btn">로그아웃</button>
                    </li>
                    <li class="nav-item">
                        <button class="cart-btn" type="button" data-bs-toggle="offcanvas" data-bs-target="#offcanvasRight" aria-controls="offcanvasRight">
                            <img src="./images/masterball.webp" alt="masterball-logo" title="장바구니">
                            <span id="cart-badge-area"></span> 
                        </button>
                        <div class="offcanvas offcanvas-end" data-bs-scroll="true" tabindex="-1" id="offcanvasRight" aria-labelledby="offcanvasRightLabel">
                            <div class="offcanvas-header">
                                <h1 class="offcanvas-title" id="offcanvasRightLabel">Cart</h1>
                                <button type="button" class="btn-close" data-bs-dismiss="offcanvas" aria-label="Close"></button>
                            </div>
                            <div class="offcanvas-body">
                                <ul class="list-group list-group-flush cart-list" id="cart-list-container"></ul>
                                <div id="cart-footer-container" class="cart-footer p-3 bg-light border-top"></div>
                            </div>
                        </div>
                    </li>
                `;

                // 마이페이지
                const mypageBtn = document.getElementById('mypage-btn');
                if (mypageBtn) {
                    mypageBtn.addEventListener('click', () => {
                        location.href = "mypage.html";
                    });
                }

                // 로그아웃
                const logoutBtn = document.getElementById('logout-btn');
                if (logoutBtn) {
                    logoutBtn.addEventListener('click', () => {
                        localStorage.removeItem('loggedInUser');
                        alert('로그아웃 되었습니다.');
                        location.href = "ProjectPokemonGoodsShop.html";
                    });
                }

                // cart.js 실행
                if (typeof initCart === 'function') {
                    initCart(user);
                }
            }
        } catch (error) {
            console.error("로그인 상태 업데이트 중 오류 발생: ", error);
        }
    }
}