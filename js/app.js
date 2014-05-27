(function(){
  Parse.initialize("DW5mOdnS4vTuOSb2did1Rb2HDulVVjPOCZZE6eGK","PvS7AF0t6hk04XSyhhUWoHDJsIQrlmNZZwFS4xOw");//初始化Parse()
  
  var templates = {};
  ['loginView', 'evaluationView', 'updateSuccessView'].forEach(function(t){
    var tpl = document.getElementById(t).text;
    templates[t] = doT.template(tpl);
  });//編譯template engine函數();

  var t={
		loginRequiredView:function(e){
			return function(){
				var current=Parse.User.current();
				if(current){
					e();
				}
				else{
					window.location.hash="login/"+window.location.hash;
				}
			}
		}
	};

  var handler = {
    navbar: function(){
      var currentUser = Parse.User.current();
      if(currentUser){
        document.getElementById('loginButton').style.display = 'none';
        document.getElementById('evaluationButton').style.display = 'block';
        document.getElementById('logoutButton').style.display = 'block';     
      } else {
        document.getElementById('loginButton').style.display = 'block';
        document.getElementById('evaluationButton').style.display = 'none';
        document.getElementById('logoutButton').style.display = 'none';     
      }
      document.getElementById('logoutButton').addEventListenerbb('click', function(){
        Parse.User.logOut();
        handlers.navbar();
        window.location.hash = "login/";
      });
    },
    loginView: function(t){
    	var r=function(e){ // check id 
			var t=document.getElementById(e).value;
			return TAHelp.getMemberlistOf(t)===false?false:true;
		};
		var i=function(e,t,n){ // display
			if(!t()){
				document.getElementById(e).innerHTML=n;
				document.getElementById(e).style.display="block";
			}
			else{
				document.getElementById(e).style.display="none";
			}
		};
		var s=function(){ // success view
			handler.navbar();
			window.location.hash=t?t:""
		};
		var o=function(){ // check password
			var e=document.getElementById("form-signup-password");
			var t=document.getElementById("form-signup-password1");
			var n=e.value===t.value?true:false;
			i("form-signup-message",function(){return n},"Password doesn't match.");
			return n;
		};
    	// 把版型印到瀏覽器上
    	document.getElementById('content').innerHTML = templates.loginView();
    	document.getElementById("form-signin-student-id").addEventListener("keyup",function(){
    		i("form-signin-message",function(){return r("form-signin-student-id")},"The student is not one of the class students.")
    	});
    	// 登入
    	document.getElementById("form-signin").addEventListener("submit",function(){
			// 綁定登入表單的學號檢查事件
			if(!r("form-signin-student-id")){
				alert("This id doesn't belong to any students in class.");
				return false;
			}
			// 綁定登入表單的登入檢查事件
			Parse.User.logIn(document.getElementById("form-signin-student-id").value,document.getElementById("form-signin-password").value,{
				success:function(e){
					s();
				},
				error:function(e,t){
					i("form-signin-message",function(){return false},"Invaild username or password.");
				}
			})
		},false);
		// 註冊
		document.getElementById("form-signup-student-id").addEventListener("keyup",function(){
			i("form-signup-message",function(){return r("form-signup-student-id")},"The student is not one of the class students.")
		});
		document.getElementById("form-signup-password1").addEventListener("keyup",o);
		document.getElementById("form-signup").addEventListener("submit",function(){
			// 綁定註冊表單的學號檢查事件
			if(!r("form-signup-student-id")){
				alert("This id doesn't belong to any students in class.");
				return false;
			}
			// 綁定註冊表單的密碼檢查事件
			var e=o();
			if(!e){
				return false;
			}
			// 綁定註冊表單的註冊檢查事件
			var t=new Parse.User;
			t.set("username",document.getElementById("form-signup-student-id").value);
			t.set("password",document.getElementById("form-signup-password").value);
			t.set("email",document.getElementById("form-signup-email").value);
			t.signUp(null,{
				success:function(e){
					s();
				},
				error:function(e,t){
					i("form-signup-message",function(){return false},t.message)
				}
			})
		},false);
    },
    evaluationView: t.loginRequiredView(function(){
    // 基本上和上課範例購物車的函數很相似，這邊會用Parse DB
    	var evaluation=Parse.Object.extend("Evaluation");
		var current=Parse.User.current();
		var access=new Parse.ACL;
		access.setPublicReadAccess(false);
		access.setPublicWriteAccess(false);
		access.setReadAccess(handler,true);
		access.setWriteAccess(handler,true);
		var q=new Parse.Query(t);
		q.equalTo("user",handler);
		q.first({
			success:function(i){
				window.EVAL=i;
				// 問看看Parse有沒有這個使用者之前提交過的peer review物件
      			// 沒有的話: 從TAHelp生一個出來(加上scores: [‘0’, ‘0’, ‘0’, ‘0’]屬性存分數並把自己排除掉
				if(i===undefined){
					var s=TAHelp.getMemberlistOf(n.get("username")).filter(function(e){
						return e.StudentId!==n.get("username")?true:false}).map(function(e){
							e.scores=["0","0","0","0"];
							return e;
						})
				}
				else{
					var s=i.toJSON().evaluations;
				}
				// 把peer review物件裡的東西透過版型印到瀏覽器上
				document.getElementById("content").innerHTML=templates.evaluationView(s);

			},
			error:function(e,t){

			}
		});
    })  
   };    
      綁定表單送出的事件(); // 如果Parse沒有之前提交過的peer review物件，要自己new一個。或更新分數然後儲存。
  var router = {
    ‘’: handler.登入view函數,
    ‘peer-evaluation’: handler.評分view函數. 
  };

  讓router活起來();
})();
