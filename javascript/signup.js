// 회원가입 문자 형식 유효성 검사
function initSignup() {
    'use strict'

    const forms = document.querySelectorAll('.signup-needs-validation')

    Array.from(forms).forEach(form => {
        form.addEventListener('submit', event => {
            if (!form.checkValidity()) {
                event.preventDefault()
                event.stopPropagation()
            }

            form.classList.add('was-validated'),
            Signup(event, form);

        }, false)
    })

    const signupname = document.getElementById('signup_inputname');
    const signupid = document.getElementById('signup_inputid');
    const signuppw = document.getElementById('signup_inputpw');
    const signuppwconfirm = document.getElementById('signup_inputpwconfirm');
    const signupcell1 = document.getElementById('signup_inputcell1');
    const signupcell2 = document.getElementById('signup_inputcell2');
    const signupcell3 = document.getElementById('signup_inputcell3');

    // 입력 형식 제한
    const signupengandkorElements = [signupname];
    const signupengandnumElements = [signupid, signuppw, signuppwconfirm];

    signupengandkorElements.forEach(function (el) {
        if (el) {
            el.addEventListener('input', function () {
                this.value = this.value.replace(/[^a-zA-Zㄱ-ㅎㅏ-ㅣ가-힣]/g, '');
            });
        }
    });

    signupengandnumElements.forEach(function (el) {
        if (el) {
            el.addEventListener('input', function () {
                this.value = this.value.replace(/[^a-zA-Z0-9]/g, '');
            });
        }
    });
    
    // 전화번호 칸 자동 넘김
    if (signupcell1) {
        signupcell1.addEventListener('input', function () {
            this.value = this.value.replace(/[^0-9]/g, '');

            if (signupcell2 && this.value.length >= 3) {
                signupcell2.focus();
            }
        });
    }

    if (signupcell2) {
        signupcell2.addEventListener('input', function () {
            this.value = this.value.replace(/[^0-9]/g, '');

            if (signupcell3 && this.value.length >= 4) {
                signupcell3.focus();
            }
        });
    }

    if (signupcell3) {
        signupcell3.addEventListener('input', function () {
            this.value = this.value.replace(/[^0-9]/g, '');
        });
    }
}

// 회원가입
function Signup(event, form) {
    // 회원가입 문자 형식 유효성 검사 통과 시
    if (form.checkValidity()) {
        event.preventDefault(); // 새로고침 막기

        const s_name = document.getElementById('signup_inputname');
        const s_id = document.getElementById('signup_inputid');
        const s_pw = document.getElementById('signup_inputpw');
        const s_pw_confirm = document.getElementById('signup_inputpwconfirm');
        const s_cell1 = document.getElementById('signup_inputcell1');
        const s_cell2 = document.getElementById('signup_inputcell2');
        const s_cell3 = document.getElementById('signup_inputcell3');

        // 비밀번호 일치 확인
        if (s_pw.value !== s_pw_confirm.value) {
            alert("비밀번호가 일치하지 않습니다.");
            s_pw_confirm.value = "";
            s_pw_confirm.focus();
            return;
        }

        // 아이디 중복 확인
        const storedUsers = JSON.parse(localStorage.getItem('userlist')) || [];
        const isDuplicate = storedUsers.some(user => user.userid === s_id.value);

        if (isDuplicate) {
            alert("이미 존재하는 아이디입니다.");
            s_id.value = "";
            s_id.focus();
            return;
        }

        // 정보 저장
        const fullCell = `${s_cell1.value}-${s_cell2.value}-${s_cell3.value}`;
        const newUser = {
            userid: s_id.value,
            userpw: s_pw.value,
            username: s_name.value,
            usercell: fullCell
        };

        storedUsers.push(newUser);
        localStorage.setItem('userlist', JSON.stringify(storedUsers));

        // 성공
        alert(`${newUser.username} 님, 회원가입 성공!`);

        const modalElement = document.getElementById('signUpModal');
        const modalInstance = bootstrap.Modal.getInstance(modalElement);
        if (modalInstance) {
            modalInstance.hide();
        }

        form.reset();
        form.classList.remove('was-validated');
    }
}