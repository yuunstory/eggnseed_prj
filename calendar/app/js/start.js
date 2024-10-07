async function CAC_START() {
  // 캘린더 배경을 흰색으로 변경 이유: 외부 CSS 영향을 받는 것을 방지하기 위해
  CAC.getRoot().querySelector('#calendar_wrap').style.backgroundColor = '#ffffff';
  CAC.getRoot().querySelector('#calendar_wrap').style.display = 'none';

  // 카페24 api 초기화
  try {
    await CAC_CAFE24API.init();
  } catch (e) {
    CAC_VIEW.isDev && console.error('CAFE24API 초기화 실패: ', e);
    return;
  }

  // 캘린더 그룹코드
  CAC_VIEW.groupId = CAC.currentElement.getAttribute('group-id');
  try {
    console.log('------------');

    !CAC_UTIL.isEcEditor() && (await CAC_CAFE24API.setEncryptedToken());

    const config = await CAC_DATA.loadConfigData();
    CAC_VIEW.calendarGroupList = config?.group_list || null;
    CAC_VIEW.basicSetting = config?.basic_setting || null;

    if (!config) {
      CAC_VIEW.isDev && console.error('config ERROR: 설정 정보가 없습니다.');
      CAC.getRoot().querySelector('#calendar_wrap').remove();
      return;
    }

    if (CAC_VIEW.group_id === null && CAC_VIEW?.basic_setting?.use_front === 'F') {
      console.log('캘린더 기본설정 노출안함');
      CAC.getRoot().querySelector('#calendar_wrap').remove();
      return;
    }

    if (!!CAC_VIEW.group_id && Object.keys(CAC_VIEW.calendarGroupList).length === 0) {
      console.log('캘린더 그룹코드가 없습니다.');
      CAC.getRoot().querySelector('#calendar_wrap').remove();
      return;
    }

    if (!CAC_UTIL.isEcEditor() && !CAC_VIEW.checkPermission()) {
      CAC_VIEW.isDev && console.error('permission ERROR: 접근권한이 없습니다. 관리자에게 문의하세요.');
      CAC.getRoot().querySelector('#calendar_wrap').remove();
      return;
    }

    try {
      CAC_VIEW.holiday = await CAC_DATA.loadHolidayData();
    } catch (e) {
      CAC_VIEW.isDev && console.log('공휴일 정보 조회 실패 했지만 계속해서 서비스 진행합니다.');
      CAC_VIEW.holiday = {};
    }

    CAC_VIEW.setCalendarTitle();
    CAC_VIEW.setCalendarGroup();

    console.log('------------');
  } catch (e) {
    CAC_VIEW.isDev && console.error('loadCalendarData ERROR: ');
    CAC_VIEW.isDev && console.error('캘린더 데이터가 없습니다. 일정을 등록해 주세요!');
    CAC_VIEW.isDev && console.error('접근권한이 없습니다. 관리자에게 문의하세요.');
    CAC.getRoot().querySelector('#calendar_wrap').remove();
    return;
  }
  CAC.getRoot().querySelector('#calendar_wrap').style.display = 'block';

  if (CAC_UTIL.isMobile()) {
    CAC_VIEW.renderCalendarMobile();
  } else {
    CAC_VIEW.renderCalendar();
  }

  CAC_VIEW.DOMContentLoaded();
}
