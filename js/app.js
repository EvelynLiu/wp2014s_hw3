(function () {
  // 初始化Parse
  Parse.initialize("DW5mOdnS4vTuOSb2did1Rb2HDulVVjPOCZZE6eGK","PvS7AF0t6hk04XSyhhUWoHDJsIQrlmNZZwFS4xOw");
  
  // 編譯template engine函數
  var templates = {};
  ["loginView", "evaluationView", "updateSuccessView", "scoreView"].forEach(function (e) {
    templateCode = document.getElementById(e).text;
    templates[e] = doT.template(templateCode);
  });

  // 檢查登入
  var commons = {
    loginRequiredView: function (ViewFunction) {
      return function () {
        var currentUser = Parse.User.current();
        if (currentUser) {
          ViewFunction();
        } 
        else {
          window.location.hash = "login/" + window.location.hash;
        }
      }
    },
  }

  var handlers = {
    // 導覽列
    navbar: function () {
      var currentUser = Parse.User.current();
      if (currentUser) {
        document.getElementById("loginButton").style.display = "none";
        document.getElementById("logoutButton").style.display = "block";
        document.getElementById("evaluationButton").style.display = "block";
        document.getElementById("scoreButton").style.display = "block";
      } else {
        document.getElementById("loginButton").style.display = "block";
        document.getElementById("logoutButton").style.display = "none";
        document.getElementById("evaluationButton").style.display = "none";
        document.getElementById("scoreButton").style.display = "block";
      }
      document.getElementById("logoutButton").addEventListener('click', function () {
        Parse.User.logOut();
        handlers.navbar();
        handlers.loginView();
        window.location.hash = 'login/';
      });
    },
    // 評分頁面
    evaluationView: commons.loginRequiredView(function () {
    // 基本上和上課範例購物車的函數很相似，這邊會用Parse DB 	
      var Evaluation = Parse.Object.extend('Evaluation');
      var currentUser = Parse.User.current();      
      var evaluationACL = new Parse.ACL();
      evaluationACL.setPublicReadAccess(false);
      evaluationACL.setPublicWriteAccess(false);
      evaluationACL.setReadAccess(currentUser, true);
      evaluationACL.setWriteAccess(currentUser, true);
      var query = new Parse.Query(Evaluation);
      query.equalTo('user', currentUser);
      query.first({
        success: function(evaluation){
          window.EVAL = evaluation;
          // 問看看Parse有沒有這個使用者之前提交過的peer review物件
      	  // 沒有的話: 從TAHelp生一個出來(加上scores: [‘0’, ‘0’, ‘0’, ‘0’]屬性存分數並把自己排除掉
          if(evaluation === undefined){
            var TeamMembers = TAHelp.getMemberlistOf(currentUser.get('username')).filter(function(e){
              return (e.StudentId !== currentUser.get('username') ) ? true : false;
            }).map(function(e){
              e.scores = ['0', '0', '0', '0'];
              return e;
            });
          } else {
            var TeamMembers = evaluation.toJSON().evaluations;
          }
          // 把peer review物件裡的東西透過版型印到瀏覽器上
          document.getElementById('content').innerHTML = templates.evaluationView(TeamMembers);
          // 登入時檢查是否已評分，若已評分將「送出表單」改變為「修改表單」
          document.getElementById('evaluationForm-submit').value = ( evaluation === undefined ) ? '送出表單' :'修改表單';
          // 綁定表單送出的事件
          document.getElementById('evaluationForm').addEventListener('submit', function(){
            for(var i = 0; i < TeamMembers.length; i++){
              for(var j = 0; j < TeamMembers[i].scores.length; j++){
                var e = document.getElementById('stu'+TeamMembers[i].StudentId+'-q'+j);
                var amount = e.options[e.selectedIndex].value;
                TeamMembers[i].scores[j] = amount;
              }
            }
            //如果Parse沒有之前提交過的peer review物件，要自己new一個。或更新分數然後儲存。
            if( evaluation === undefined ){
              evaluation = new Evaluation();
              evaluation.set('user', currentUser);
              evaluation.setACL(evaluationACL);
            }
            console.log(TeamMembers);
            evaluation.set('evaluations', TeamMembers);
            evaluation.save(null, {
              success: function(){
                document.getElementById('content').innerHTML = templates.updateSuccessView();
              },
              error: function(){},
            });

          }, false);
        }, error: function(object, err){
        
        }
      }); 
    }),
	scoreView: function(){
		/*var TeamMembers = TAHelp.getMemberlistOf(currentUser.get('username')).filter(function(e){
              return (e.StudentId !== currentUser.get('username') ) ? true : false;
            }).map(function(e){
              e.scores = ['0', '0', '0', '0'];
              return e;
            });*/
        document.getElementById('content').innerHTML = templates.scoreView();    
	},
	
	/*scoreView: commons.loginRequiredView(function () {
		var TeamMembers = TAHelp.getMemberlistOf(currentUser.get('username')).filter(function(e){
              return (e.StudentId !== currentUser.get('username') ) ? true : false;
            }).map(function(e){
              e.scores = ['0', '0', '0', '0'];
              return e;
            });
		document.getElementById('content').innerHTML = templates.scoreView(TeamMembers);
	}),*/

	// 登入頁面
    loginView: function (redirect) {
      // 檢查ID	
      var checkVaildStudentID = function(DOM_ID) {
        var student_ID = document.getElementById(DOM_ID).value;
        return (TAHelp.getMemberlistOf(student_ID) === false) ? false : true;
      }
      // Display
      var showMessage = function(DOM_ID, fn, msg) {
        if (!fn()) {
          document.getElementById(DOM_ID).innerHTML = msg;
          document.getElementById(DOM_ID).style.display = "block";
        } else {
          document.getElementById(DOM_ID).style.display = "none";
        }
      }
      // 登入成功->評分
      var postAction = function() {
        handlers.navbar();
        handlers.evaluationView();
        window.location.hash = (redirect) ? redirect : '';
      }
      // 檢查密碼
      var passwordMatch = function(){
        var singupForm_password = document.getElementById('form-signup-password');
        var singupForm_password1 = document.getElementById('form-signup-password1');
        var BOOL = (singupForm_password.value === singupForm_password1.value) ? true : false;
        showMessage('form-signup-message', function(){return BOOL;}, 'Passwords don\'t match.');
        return BOOL;
      }
      // 把版型印到瀏覽器上
      document.getElementById("content").innerHTML = templates.loginView();
      // 登入
      document.getElementById("form-signin-student-id").addEventListener("keyup", function () {
        // 綁定登入表單的學號檢查事件(打字時)
        showMessage('form-signin-message', function(){return checkVaildStudentID("form-signin-student-id")}
            , 'The student is not one of the class students.');
      });
      document.getElementById("form-signin").addEventListener("submit", function () {
        // 綁定登入表單的學號檢查事件(送出時)
        if (!checkVaildStudentID("form-signin-student-id")) {
          alert("The student is not one of the class students.");
          return false;
        }
        // 綁定登入表單的登入檢查事件
        Parse.User.logIn(document.getElementById("form-signin-student-id").value,
          document.getElementById("form-signin-password").value, {
            success: function(user) {
              postAction();
            },
            error: function (user, error) {
              showMessage('form-signin-message', function () {
                return false;
              }, "Invaild username or password.");
            }
          });
      }, false);
      // 註冊
      document.getElementById("form-signup-student-id").addEventListener("keyup", function () {
        // 綁定註冊表單的學號檢查事件(打字時)
        showMessage('form-signup-message', function(){return checkVaildStudentID("form-signup-student-id")}
            , 'The student is not one of the class students.');
      });
      document.getElementById("form-signup-password1").addEventListener('keyup', passwordMatch);
      document.getElementById("form-signup").addEventListener("submit", function (){
        // 綁定註冊表單的學號檢查事件(送出時)
        if (!checkVaildStudentID('form-signup-student-id')){
          alert("The student is not one of the class students."); 
          return false;
        }
        // 綁定註冊表單的密碼檢查事件
        var BOOL = passwordMatch();
        if(!BOOL){
          return false;
        }
        // 綁定註冊表單的註冊檢查事件
        var user = new Parse.User();
        user.set("username", document.getElementById('form-signup-student-id').value);
        user.set("password", document.getElementById('form-signup-password').value);
        user.set("email", document.getElementById('form-signup-email').value);
        user.signUp(null, {
          success: function(user){
            postAction();
          },
          error: function(user, error){
            showMessage('form-signup-message', function () {
              return false;
            }, error.message);
          }
        });
      }, false);
    }
  };

  // Router
  var Router = Parse.Router.extend({
    routes: {
      "": "indexView",
      "peer-evaluation/": "evaluationView",
      "login/*redirect": "loginView",
      "score/":"scoreView",
    },
    indexView: handlers.evaluationView,
    evaluationView: handlers.evaluationView,
    loginView: handlers.loginView,
    scoreView: handlers.scoreView,
  });
  //讓router活起來
  this.Router = new Router();
  Parse.history.start();
  handlers.navbar();

})();