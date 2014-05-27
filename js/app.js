(function(){
	Parse.initialize("DW5mOdnS4vTuOSb2did1Rb2HDulVVjPOCZZE6eGK","PvS7AF0t6hk04XSyhhUWoHDJsIQrlmNZZwFS4xOw");
	var e={}; // e--->template
	["loginView","evaluationView","updateSuccessView"].forEach(function(t){
		templateCode=document.getElementById(t).text;
		e[t]=doT.template(templateCode)
	});
	var t={
		loginRequiredView:function(e){
			return function(){
				var t=Parse.User.current();
				if(t){
					e()
				}
				else{
					window.location.hash="login/"+window.location.hash
				}
			}
		}
	};
	var n={ //n----->handler
		navbar:function(){
			var e=Parse.User.current();
			if(e){
				document.getElementById("loginButton").style.display="none";
				document.getElementById("logoutButton").style.display="block";
				document.getElementById("evaluationButton").style.display="block"
			}
			else{
				document.getElementById("loginButton").style.display="block";
				document.getElementById("logoutButton").style.display="none";
				document.getElementById("evaluationButton").style.display="none"
			}
			document.getElementById("logoutButton").addEventListener("click",function(){
				Parse.User.logOut();
				n.navbar();
				window.location.hash="login/"
			})
		},
		evaluationView:t.loginRequiredView(function(){
			var t=Parse.Object.extend("Evaluation");
			var n=Parse.User.current();
			var r=new Parse.ACL;
			r.setPublicReadAccess(false);
			r.setPublicWriteAccess(false);
			r.setReadAccess(n,true);
			r.setWriteAccess(n,true);
			var i=new Parse.Query(t);
			i.equalTo("user",n);
			i.first({
				success:function(i){
					window.EVAL=i;
					if(i===undefined){
						var s=TAHelp.getMemberlistOf(n.get("username")).filter(function(e){
							return e.StudentId!==n.get("username")?true:false
						}).map(function(e){
							e.scores=["0","0","0","0"];
							return e
						})
					}
					else{
						var s=i.toJSON().evaluations
					}
					document.getElementById("content").innerHTML=e.evaluationView(s);
					document.getElementById("evaluationForm-submit").value=i===undefined?"�銵典":"靽格銵典";
					document.getElementById("evaluationForm").addEventListener("submit",function(){
						for(var o=0;o<s.length;o++){
							for(var u=0;u<s[o].scores.length;u++){
								var a=document.getElementById("stu"+s[o].StudentId+"-q"+u);
								var f=a.options[a.selectedIndex].value;s[o].scores[u]=f
							}
						}
						if(i===undefined){
							i=new t;
							i.set("user",n);
							i.setACL(r)}console.log(s);
							i.set("evaluations",s);
							i.save(null,{
								success:function(){
									document.getElementById("content").innerHTML=e.updateSuccessView()
								},
								error:function(){

								}
							})
					},false);
				},
				error:function(e,t){

				}
			})
		}),
		loginView:function(t){
	var r=function(e){
		var t=document.getElementById(e).value;
		return TAHelp.getMemberlistOf(t)===false?false:true
	};
	var i=function(e,t,n){
		if(!t()){
			document.getElementById(e).innerHTML=n;
			document.getElementById(e).style.display="block"
		}
		else{
			document.getElementById(e).style.display="none"
		}
	};
	var s=function(){
		n.navbar();
		window.location.hash=t?t:""
	};
	var o=function(){
		var e=document.getElementById("form-signup-password");
		var t=document.getElementById("form-signup-password1");
		var n=e.value===t.value?true:false;
		i("form-signup-message",function(){return n},"Passwords don't match.");
		return n
	};
	document.getElementById("content").innerHTML=e.loginView();
	document.getElementById("form-signin-student-id").addEventListener("keyup",function(){
		i("form-signin-message",function(){
			return r("form-signin-student-id")
		},"The student is not one of the class students.")
	});
	document.getElementById("form-signin").addEventListener("submit",function(){
		if(!r("form-signin-student-id")){
			alert("The student is not one of the class students.");
			return false
		}
		Parse.User.logIn(document.getElementById("form-signin-student-id").value,document.getElementById("form-signin-password").value,{
			success:function(e){
				s()
			},
			error:function(e,t){
				i("form-signin-message",function(){return false},"Invaild username or password.")
			}
		})
	},false);
	document.getElementById("form-signup-student-id").addEventListener("keyup",function(){
		i("form-signup-message",function(){return r("form-signup-student-id")},"The student is not one of the class students.")
	});
	document.getElementById("form-signup-password1").addEventListener("keyup",o);
	document.getElementById("form-signup").addEventListener("submit",function(){
		if(!r("form-signup-student-id")){
			alert("The student is not one of the class students.");
			return false
		}
		var e=o();
		if(!e){
			return false
		}
		var t=new Parse.User;
		t.set("username",document.getElementById("form-signup-student-id").value);
		t.set("password",document.getElementById("form-signup-password").value);
		t.set("email",document.getElementById("form-signup-email").value);
		t.signUp(null,{
			success:function(e){
				s()
			},
			error:function(e,t){
				i("form-signup-message",function(){return false},t.message)
			}
		})
	},false)
	}};
	var r=Parse.Router.extend({
		routes:{
			"":"indexView",
			"peer-evaluation/":"evaluationView",
			"login/*redirect":"loginView"
		},
		indexView:n.evaluationView,
		evaluationView:n.evaluationView,
		loginView:n.loginView
	});
	this.Router=new r;
	Parse.history.start();
	n.navbar()
})
()
/*(function(){
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
        handler.navbar();
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
		var q=new Parse.Query(evaluation);
		q.equalTo("user",current);
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
				// 登入時檢查是否已評分，若已評分將「送出表單」改變為「修改表單」
				document.getElementById("evaluationForm-submit").value=i===undefined?"Submit the form":"Modify the form";
				// 綁定表單送出的事件
				document.getElementById("evaluationForm").addEventListener("submit",function(){
					for(var j=0;j<s.length;j++){
						for(var k=0;k<s[j].scores.length;k++){
							var a=document.getElementById("stu"+s[j].StudentId+"-q"+k);
							var f=a.options[a.selectedIndex].value;s[j].scores[k]=f;
						}
					}
					//如果Parse沒有之前提交過的peer review物件，要自己new一個。或更新分數然後儲存。
					if(i===undefined){
						i=new evaluation;
						i.set("user",current);
						i.setACL(access)}console.log(s);
						i.set("evaluations",s);
						i.save(null,{
							success:function(){
								document.getElementById("content").innerHTML=templates.updateSuccessView();
							},
							error:function(){

							}
						})
				},false);
			},
			error:function(e,t){

			}
		});
    })  
   };    

  var router = Parse.Router.extend({
    routes:{
    	'':'indexView',
    	'login/*redirect':'loginView',
    	'peer-evaluation/':'evaluationView'
    },
	indexView:handler.evaluationView,
	loginView:handler.loginView,
	evaluationView:handler.evaluationView 
  };
  //讓router活起來
  this.Router=new router;
  Parse.history.start();
  handler.navbar();
})();*/
