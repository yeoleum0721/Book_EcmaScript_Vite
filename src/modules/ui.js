// UI 관리 모듈 - 구조분해할당과 화살표 함수 사용

// 메시지 스타일 설정
const messageStyles = {
    success: {
        color: '#28a745',
        backgroundColor: '#d4edda',
        borderColor: '#c3e6cb'
    },
    error: {
        color: '#dc3545',
        backgroundColor: '#f8d7da',
        borderColor: '#f5c6cb'
    }
}

// UI 상태 관리
let messageTimer = null

// UI 서비스 객체
export const uiService = {
    // 성공 메시지 표시 (화살표 함수)
    showSuccess: (message) => {
        uiService.showMessage(message, 'success')
    },

    // 에러 메시지 표시 (화살표 함수)
    showError: (message) => {
        uiService.showMessage(message, 'error')
    },

    // 메시지 표시 함수 (구조분해할당 활용)
    showMessage: (message, type = 'error') => {
        // DOM에서 메시지를 표시할 HTML 요소를 찾습니다
        // id가 'formError'인 요소 (보통 <span> 또는 <div>)        
        const errorSpan = document.getElementById('formError')

        // 요소가 존재하지 않으면 함수를 종료합니다 (방어적 프로그래밍)
        if (!errorSpan) return

        // 이전에 설정된 자동 숨김 타이머가 있다면 제거합니다
        // 새 메시지가 나타나면 이전 메시지의 타이머를 취소해야 합니다
        uiService.clearMessageTimer()

        // 스타일 가져오기 (구조분해할당)
        /*
            // type이 'success'인 경우
            messageStyles['success'] // { color: '#28a745', backgroundColor: '#d4edda', borderColor: '#c3e6cb' }

            // type이 'error'인 경우  
            messageStyles['error']   // { color: '#dc3545', backgroundColor: '#f8d7da', borderColor: '#f5c6cb' }

            // type이 'unknown'인 경우 (존재하지 않는 키)
            messageStyles['unknown'] // undefined

            // 만약 messageStyles[type]이 undefined라면 messageStyles.error를 사용
            messageStyles[type] || messageStyles.error

            // 예시:
            messageStyles['unknown'] || messageStyles.error  // messageStyles.error를 반환
            messageStyles['success'] || messageStyles.error  // messageStyles['success']를 반환

            // 최종적으로 선택된 객체에서 속성들을 추출
            const { color, backgroundColor, borderColor } = 선택된객체

            // 실제로는 이렇게 동작:
            const selectedStyle = messageStyles[type] || messageStyles.error
            const color = selectedStyle.color
            const backgroundColor = selectedStyle.backgroundColor  
            const borderColor = selectedStyle.borderColor

            1. messageStyles[type]에서 해당 타입의 스타일을 찾습니다.
            2. 만약 type이 잘못되었거나 없으면 기본값으로 error 스타일을 사용합니다.
            3. 선택된 객체에서 color, backgroundColor, borderColor 속성을 추출합니다
        */
        const { color, backgroundColor, borderColor } = messageStyles[type] || messageStyles.error

        // 메시지 내용을 HTML 요소에 설정합니다
        errorSpan.textContent = message
        // 메시지를 화면에 보이도록 설정합니다
        errorSpan.style.display = 'block'
        // 구조분해할당으로 추출한 스타일 값들을 적용합니다
        errorSpan.style.color = color
        errorSpan.style.backgroundColor = backgroundColor
        errorSpan.style.borderColor = borderColor

        // 메시지 타입에 따라 자동 숨김 시간을 결정합니다
        // 성공 메시지: 3초 후 사라짐
        // 에러 메시지: 5초 후 사라짐 (더 오래 표시)        
        const duration = type === 'success' ? 3000 : 5000

        // 지정된 시간 후에 메시지를 자동으로 숨기는 타이머를 설정합니다
        messageTimer = setTimeout(() => {
            uiService.hideMessage()
        }, duration)
    },

    // 메시지를 숨기고 스타일을 초기화하는 함수 (화살표 함수)
    hideMessage: () => {
        // 메시지 표시 요소를 다시 찾습니다
        const errorSpan = document.getElementById('formError')
        // 요소가 존재하지 않으면 함수를 종료합니다
        if (!errorSpan) return

        // 메시지를 화면에서 숨깁니다
        errorSpan.style.display = 'none'
        // 이전에 적용된 스타일들을 제거합니다 (빈 문자열로 설정하면 CSS 기본값으로 돌아감)
        errorSpan.style.backgroundColor = ''    // 배경색 초기화
        errorSpan.style.borderColor = ''        // 테두리색 초기화

        // 혹시 남아있는 타이머도 정리합니다
        uiService.clearMessageTimer()
    },

    // 메시지 자동 숨김 타이머를 해제하는 함수 (화살표 함수)
    clearMessageTimer: () => {
        // 타이머가 설정되어 있는지 확인합니다
        if (messageTimer) {
            // 타이머를 취소합니다 (더 이상 실행되지 않음)
            clearTimeout(messageTimer)
            // 타이머 변수를 초기화합니다
            messageTimer = null
        }
    },

    // 버튼의 로딩 상태를 관리하는 함수 (구조분해할당)
    setButtonLoading: (button, isLoading = false, text = '') => {
        // 버튼 요소가 존재하지 않으면 함수를 종료합니다
        if (!button) return

        // 로딩 상태에 따라 버튼을 비활성화/활성화합니다
        // true: 버튼 클릭 불가, false: 버튼 클릭 가능
        button.disabled = isLoading

        // 새로운 텍스트가 제공되면 버튼 텍스트를 변경합니다
        if (text) {
            button.textContent = text  // 예: "등록 중..." 또는 "학생 등록"
        }

        // 로딩 중일 때와 아닐 때의 시각적 스타일을 다르게 적용합니다
        if (isLoading) {
            // 로딩 중: 흐리게 표시하고 마우스 커서를 금지 표시로 변경
            button.style.opacity = '0.7'        // 70% 투명도 (흐리게)
            button.style.cursor = 'not-allowed' // 금지 커서
        } else {
            // 로딩 완료: 원래 상태로 복원
            button.style.opacity = '1'      // 100% 불투명 (선명하게)
            button.style.cursor = 'pointer' // 손가락 커서
        }
    }
}