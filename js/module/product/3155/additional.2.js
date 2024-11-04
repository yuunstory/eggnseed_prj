// 상품상세 탭 이벤트
$('#tabProduct a').click(function(e){
    var oTarget = $(this).attr('href');
    $(this).parent('li').addClass('selected').siblings().removeClass('selected');

    $('#tabProduct a').each(function(){
        var oSiblings = $(this).attr('href');
        if (oTarget != oSiblings) {
            $(oSiblings).hide();
        } else {
            $(oTarget).show();
        }
    });
    e.preventDefault();
});