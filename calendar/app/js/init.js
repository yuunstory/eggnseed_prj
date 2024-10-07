const CAC = {
  currentElement: null,
  getRoot: function () {
    return this.currentElement.shadowRoot;
  },
};

const CAC_UTIL = {
  is_mobile: false,
  isMobile: function () {
    return this.is_mobile;
  },

  loadCSS: async function (url) {
    const response = await fetch(url);
    const cssText = await response.text();
    const style = document.createElement('style');
    style.textContent = cssText;
    return style;
  },
  debounce: function (func, wait, immediate = false) {
    let timeout;
    return function () {
      const context = this;
      const args = arguments;
      const later = function () {
        timeout = null;
        if (!immediate) func.apply(context, args);
      };
      const callNow = immediate && !timeout;
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
      if (callNow) func.apply(context, args);
    };
  },
  isEcEditor: function () {
    return new URLSearchParams(window.location.search).get('PREVIEW_SDE') === '1';
  },
};

const CAC_CAFE24API = {
  SDK: null,
  CONFIG: null,

  init: async function () {
    this.CONFIG = await this.getConfiguration();
    CAC_CAFE24API.SDK =
      !CAC_UTIL.isEcEditor() &&
      CAFE24API.init({
        client_id: this.CONFIG?.client_id,
        version: this.CONFIG?.app_version,
      });
  },

  getSiteName: function () {
    return document.head.querySelector('meta[property="og:site_name"]')?.content;
  },

  getConfiguration: async function () {
    return await new Promise(async (resolve, reject) => {
      await fetch(`/calendar/app/config.json`)
        .then((res) => res.json())
        .then(resolve)
        .catch((e) => reject(e));
    });
  },

  getProducts: async function (productNo) {
    return await new Promise((resolve, reject) => {
      CAC_CAFE24API.SDK.get('/api/v2/products/' + productNo, function (err, res) {
        if (err) {
          resolve(null);
        } else {
          resolve(res?.product);
        }
      });
    });
  },

  setEncryptedToken: async function () {
    await CAFE24API.getEncryptedMemberId(this.CONFIG?.client_id, async function (err, res) {
      if (!!res?.member_id) {
        const memberTokenRes = await CAC_DATA.getMemberToken(res?.member_id);
        if (memberTokenRes.code === 200) {
          CAC_VIEW.token = memberTokenRes.data?.token;
          CAC_VIEW.member_id = memberTokenRes.data?.member_id;
          CAC_VIEW.group_no = memberTokenRes.data?.group_no;
        }
      }
      CAC_VIEW.isDev && console.log('setEncryptedToken: ', res);
    });
  },
};

const CAC_DATA = {
  getDataUrl: function () {
    return CAFE24.FRONT_JS_CONFIG_MANAGE.cdnUrl ?? location.origin;
  },

  // 회원토큰
  getMemberToken: async function (token) {
    return await fetch(`${CAC_CAFE24API.CONFIG.app_front}/api/open/auth`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        token: token,
      }),
    }).then((res) => res.json());
  },

  loadConfigData: async function () {
    const data = {
      mall_id: CAFE24API.MALL_ID,
      shop_no: CAFE24API.SHOP_NO,
    };
    return await fetch(`${CAC_CAFE24API.CONFIG.app_front}/api/open/config`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    })
      .then((res) => res.json())
      .then((res) => res.data)
      .catch((e) => {
        console.error('loadConfigData ERROR: ' + e);
      });
  },

  loadHolidayData: async function () {
    return await fetch(`${CAC_CAFE24API.CONFIG.app_front}/openapi/holiday`)
      .then((res) => res.json())
      .catch((e) => console.error('loadHolidayData ERROR'));
  },

  loadMarketPromotionData: async function (beginDate, endDate, searchKeyword = '') {
    const data = {
      begin_date: beginDate,
      end_date: endDate,
      title: searchKeyword,
      mall_id: CAFE24API.MALL_ID,
      shop_no: CAFE24API.SHOP_NO,
    };
    return await fetch(`${CAC_CAFE24API.CONFIG.app_front}/api/open/mp/promotion`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    })
      .then((res) => res.json())
      .then((res) => res.data)
      .catch((e) => console.error('loadMarketPromotionData ERROR'));
  },

  loadRemoteCalendarData: async function (beginDate, endDate, searchKeyword = '') {
    const data = {
      mall_id: CAFE24API.MALL_ID,
      shop_no: CAFE24API.SHOP_NO,
      standard_start_datetime: beginDate,
      standard_end_datetime: endDate,
      token: CAC_VIEW.token || '',
      calendar_group_id: CAC_VIEW.group_id || '',
      search_keyword: searchKeyword,
    };
    return await fetch(`${CAC_CAFE24API.CONFIG.app_front}/api/open/calendar`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    })
      .then((res) => res.json())
      .then((res) => res.data)
      .catch((e) => console.error('loadRemoteCalendarData ERROR'));
  },
};

class Cafe24AppCalendar extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });

    CAC.currentElement = this;
    moment.locale('ko', {
      months: '1월_2월_3월_4월_5월_6월_7월_8월_9월_10월_11월_12월'.split('_'),
      monthsShort: '1월_2월_3월_4월_5월_6월_7월_8월_9월_10월_11월_12월'.split('_'),
      weekdays: '일요일_월요일_화요일_수요일_목요일_금요일_토요일'.split('_'),
      weekdaysShort: '일_월_화_수_목_금_토'.split('_'),
      weekdaysMin: '일_월_화_수_목_금_토'.split('_'),
      longDateFormat: {
        LT: 'A h:mm',
        LTS: 'A h:mm:ss',
        L: 'YYYY.MM.DD.',
        LL: 'YYYY년 MMMM D일',
        LLL: 'YYYY년 MMMM D일 A h:mm',
        LLLL: 'YYYY년 MMMM D일 dddd A h:mm',
        l: 'YYYY.MM.DD.',
        ll: 'YYYY년 MMMM D일',
        lll: 'YYYY년 MMMM D일 A h:mm',
        llll: 'YYYY년 MMMM D일 dddd A h:mm',
      },
      calendar: {
        sameDay: '오늘 LT',
        nextDay: '내일 LT',
        nextWeek: 'dddd LT',
        lastDay: '어제 LT',
        lastWeek: '지난주 dddd LT',
        sameElse: 'L',
      },
      relativeTime: {
        future: '%s 후',
        past: '%s 전',
        s: '몇 초',
        ss: '%d초',
        m: '1분',
        mm: '%d분',
        h: '한 시간',
        hh: '%d시간',
        d: '하루',
        dd: '%d일',
        M: '한 달',
        MM: '%d달',
        y: '일 년',
        yy: '%d년',
      },
      dayOfMonthOrdinalParse: /\d{1,2}(일|월|주)/,
      ordinal: function (number, period) {
        switch (period) {
          case 'd':
          case 'D':
          case 'DDD':
            return number + '일';
          case 'M':
            return number + '월';
          case 'w':
          case 'W':
            return number + '주';
          default:
            return number;
        }
      },
      meridiemParse: /오전|오후/,
      isPM: function (token) {
        return token === '오후';
      },
      meridiem: function (hour, minute, isUpper) {
        return hour < 12 ? '오전' : '오후';
      },
    });

    CAC_UTIL.is_mobile = document.documentElement.clientWidth <= 766;

    if (window.top !== window.self) {
      //window.top.document.querySelector('.app-body').getAttribute('data-device') 변경을 감지하여 모바일, PC 구분
      const appBodyEl = window.top.document?.querySelector('.app-body') ?? null;
      if (appBodyEl && appBodyEl?.getAttribute('data-device') !== 'undefined') {
        const observer = new MutationObserver(async (mutationsList, observer) => {
          for (let mutation of mutationsList) {
            if (mutation.type === 'attributes') {
              CAC_UTIL.is_mobile = appBodyEl?.getAttribute('data-device') === 'mo';
              // cafe24-app-calendar 태그 삭제후 다시 그리기
              this.shadowRoot.innerHTML = '';
              await this.render();
            }
          }
        });
        observer.observe(appBodyEl, { attributes: true });
      }
    }
    // else {
    //     // 리사이징 감시
    //     window.addEventListener('resize', CAC_UTIL.debounce(async () => {
    //         CAC_UTIL.is_mobile = document.documentElement.clientWidth <= 766
    //         // cafe24-app-calendar 태그 삭제후 다시 그리기
    //         this.shadowRoot.innerHTML = '';
    //         await this.render();
    //     }, 300));
    // }
  }

  async connectedCallback() {
    // set moment locale
    if (CAC_UTIL.isEcEditor() && document.querySelectorAll('cafe24-app-calendar').length > 1) {
      alert('한 페이지에 한 개의 캘린더만 추가할 수 있습니다.');
      return;
    }
    this.shadowRoot.innerHTML = '';
    await this.render();
  }

  async render() {
    const [fontsStyle, resetStyle, calendarStyle] = await Promise.all([
      CAC_UTIL.loadCSS('https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@100..900&display=swap'),
      CAC_UTIL.loadCSS('/calendar/app/css/reset.css'),
      CAC_UTIL.loadCSS('/calendar/app/css/calendar.css'),
    ]);

    this.shadowRoot.appendChild(fontsStyle);
    this.shadowRoot.appendChild(resetStyle);
    this.shadowRoot.appendChild(calendarStyle);

    const template = CAC_UTIL.isMobile()
      ? document.getElementById('calendar-app-template-mo').content
      : document.getElementById('calendar-app-template-pc').content;
    this.shadowRoot.appendChild(template.cloneNode(true));
    await CAC_START();
  }
}

customElements.define('cafe24-app-calendar', Cafe24AppCalendar);
