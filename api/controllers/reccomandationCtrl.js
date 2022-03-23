"use strict";

var mongoose = require("mongoose"),
  multer = require("multer"),
  constants = require("../constants/constants"),
  users = mongoose.model("users"),
  feedback = mongoose.model("feedback"),
  friendsrecommendations = mongoose.model("friendsrecommendations"),
  likes = mongoose.model("like"),
  dislikes = mongoose.model("dislike"),
  comments = mongoose.model("comment"),
  admin = mongoose.model("admin"),
  friends = mongoose.model("friends"),
  categories = mongoose.model("category"),
  plaform = mongoose.model("platform"),
  subcategories = mongoose.model("subcategory"),
  categoryfollow = mongoose.model("categoryfollow"),
  subcategoryfollow = mongoose.model("subcategoryfollow"),
  reccnotification = mongoose.model("reccnotification"),
  feedbacks = mongoose.model("feedback"),
  notification = mongoose.model("notification"),
  favourites = mongoose.model("favourites"),
  reccomandation = mongoose.model("reccomandations");
var path = require("path");

const errors = ["", null, undefined];
var arraySort = require("array-sort");

var FCM = require("fcm-node");
var serverKey =
  "AAAAL2kzemI:APA91bGv518f9J7FgmSpyMWIKQyvaqT68IuG_DoJd2OFtPIJw8aVuCgy9OVrC5JcCYyZDGEj3bbmibtc1X_cN0GFjtgQhc6Cxr8YziBvHlSBaGSbex0PfF5NbDVpaSfqLvv_-tjAXmke"; //put your server key here
var fcm = new FCM(serverKey);

function formatDate() {
  var d = new Date(),
    month = "" + (d.getMonth() + 1),
    day = "" + d.getDate(),
    year = d.getFullYear();

  if (month.length < 2) month = "0" + month;
  if (day.length < 2) day = "0" + day;

  return [year, month, day].join("-");
}

//******************** Upload image function ************************
exports.upload_recc_image = function (req, res) {
  try {
    var storage = multer.diskStorage({
      destination: function (req, file, cb) {
        cb(null, "../images/");
      },
      filename: function (req, file, cb) {
        var efile = file.originalname.replace(/ /g, "_");
        efile = efile.replace(/[&\/\\#,+()$~%'":*?<>{}]/g, "");
        cb(null, new Date().getTime() + efile);
      },
    });
    var upload = multer({ storage: storage }).single("file");
    upload(req, res, function (err) {
      res.json(req.file.filename);
      if (err) {
        res.json({ error_code: 1, err_desc: err });
        return;
      }
    });
  } catch (err) {
    res.json({ error_code: 1, err_desc: err });
  }
};

//****************  create_reccomandation_function ****************************
exports.add_recc = function (req, res) {
  var formatted_date = formatDate();
  try {
    var new_recc = new reccomandation({
      title: req.body.title,
      type: req.body.type,
      description: req.body.description,
      category: req.body.category,
      platform: req.body.platform,
      tags: req.body.tags,
      sub_category: req.body.sub_category,
      image: req.body.image,
      web_link: req.body.web_link,
      user_id: req.body.user_id,
      created_at: new Date(),
      formatted_date: formatted_date,
      add_user_type: req.body.add_user_type,
      comment_count: 0,
      like_count: 0,
      web_link_content:
        req.body.add_user_type == "user" ? req.body.web_link_content : null,
      location: req.body.location,
      lat: req.body.lat,
      long: req.body.long,
      cords: req.body.cords,
      // recc_type: req.body.recc_type,
      recc_contact: req.body.recc_contact,
    });

    new_recc.save(function (err, recc) {
      res.send({
        data: recc,
        status: 1,

        msg: "Recommendation added successfully!",
      });
      friends.find({ userId: req.body.user_id }, function (err, doc1) {
        if (doc1.length > 0) {
          doc1.forEach(function (item1) {
            friends.find({ userId: item1.friendId }, function (err, doc2) {
              doc2.forEach(function (item2) {
                if (item2.friendId == req.body.user_id) {
                  users.findOne(
                    { _id: req.body.user_id },
                    function (err, send) {
                      users.findOne(
                        { _id: item1.friendId },
                        function (err, recieve) {
                          saveNotification(
                            recieve.fcm_token,
                            send.name + " added a new post",
                            req.body.user_id,
                            item1.friendId,
                            "add post",
                            recc._id,
                            recc
                          );
                        }
                      );
                    }
                  );
                }
              });
            });
          });
        }
      });

      // saveNotification(senderId, receiverId,noti_type, itemId);
    });
  } catch (err) {
    res.send({
      data: null,
      status: 0,

      err: err,
    });
  }
};

function youtube_parser(url) {
  var regExp =
    /^https?\:\/\/(?:www\.youtube(?:\-nocookie)?\.com\/|m\.youtube\.com\/|youtube\.com\/)?(?:ytscreeningroom\?vi?=|youtu\.be\/|vi?\/|user\/.+\/u\/\w{1,2}\/|embed\/|watch\?(?:.*\&)?vi?=|\&vi?=|\?(?:.*\&)?vi?=)([^#\&\?\n\/<>"']*)/i;
  var match = url.match(regExp);
  return match && match[1].length == 11 ? match[1] : false;
}

function getId(url) {
  var regExp =
    /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  var match = url.match(regExp);
  if (match && match[2].length == 11) {
    return "https://www.youtube.com/embed/" + match[2];
  } else {
    return "error";
  }
}
{
  description: {
    $regex: /.*an.*/i;
  }
}

// exports.get_searched_all_recc = function(req, res){
//     var pageNo = parseInt(req.body.skip);
//   	var size = parseInt(req.body.limit);
//   	var skip = size * (pageNo - 1);
//   	var query = {};
//   	if(req.body.cat == "All"){
//   		if(req.body.filter_cat_array.length > 0){
//   			query = {category: {$in : req.body.filter_cat_array}, $or:[{}, {}, {}, {}]};
//   		}

//   	}else{
//   		query = { category:req.body.cat };
//   	}

// 	reccomandation.find(query).limit(size).skip(skip).sort({like_count: -1, comment_count: -1 ,created_at:-1}).limit(size).skip(skip).exec(function(err, doc) {
//       	var counter = 0,
//       	dict = {},
//       	data = [];

//       	function getUserDetails(){
// 	        // console.log(doc[counter]);
// 	        if(counter < doc.length){
// 	          // if(typeof(doc[counter].userId) != 'undefined'){
// 	            users.findOne({'_id': doc[counter].user_id}, function(err, doc1){
// 	              	likes.find({'postId': doc[counter]._id}, function(err, like){
// 	              		dislikes.find({'postId': doc[counter]._id}, function(err, dislike){
// 		                	comments.find({'postId': doc[counter]._id}, function(err, comments){
// 		                	favourites.findOne({recc_id: doc[counter]._id, user_id: req.body.user_id },null, function(err, favour) {
// 		                		categories.findOne({_id: doc[counter].category },null, function(err, cat) {

// 		                			plaform.findOne({_id: doc[counter].platform },null, function(err, plat) {

// 			                			subcategories.findOne({_id: doc[counter].sub_category },null, function(err, sub_cat) {

// 				                			categoryfollow.findOne({cat_id: doc[counter].category , user_id: req.body.user_id},null, function(err, followcat) {

// 				                				console.log('followcat = ', followcat);

// 												subcategoryfollow.findOne({sub_cat_id: doc[counter].sub_category , user_id: req.body.user_id},null, function(err, followsubcat) {

// 													console.log('followsubcat = ', followsubcat);

// 													friends.findOne({friendId: doc[counter].user_id , userId: req.body.user_id},null, function(err, followuser) {

// 														console.log('followuser = ', followuser);
// 							                			admin.findOne({}, function(err, admindoc){
// 										                  	var count = 0,
// 										                    dic= {},
// 										                    commentData = [];

// 										                    function getname(str, user, admin){
// 										                    	if(str == 'name'){
// 										                    		if(doc[counter].add_user_type == 'user'){
// 											                    		if(errors.indexOf(user) == -1){
// 												                    		return user.name;
// 												                    	}else{
// 												                    		return '';
// 												                    	}
// 											                    	}else{
// 											                    		if(errors.indexOf(admindoc) == -1){
// 												                    		return admindoc.firstname;
// 												                    	}else{
// 												                    		return '';
// 												                    	}
// 										                    		}
// 										                    	}else if(str == 'image'){
// 										                    		if(doc[counter].add_user_type == 'user'){
// 											                    		if(errors.indexOf(user) == -1){
// 												                    		return user.image;
// 												                    	}else{
// 												                    		return '';
// 												                    	}
// 											                    	}else{
// 											                    		if(errors.indexOf(admindoc) == -1){
// 												                    		return admindoc.image;
// 												                    	}else{
// 												                    		return '';
// 												                    	}
// 										                    		}
// 										                    	}else{
// 										                    		if(errors.indexOf(user) == -1){
// 											                    		return user.medium;
// 											                    	}else{
// 											                    		return '';
// 											                    	}
// 										                    	}
// 										                    }

// 										                    function getCommentUserDetails(){
// 										                      // users.findOne({'_id': doc[counter].user_id}, function(err, user){
// 										                      	console.log('get all recc', count)
// 										                      	users.findOne({'_id': comments[count].userId}, function(err, user){
// 										                        // if(count < comments.length){
// 										                          dic = {
// 										                            comment: comments[count].comment,
// 										                            postId: comments[count].postId,
// 										                            userId: comments[count].userId,
// 										                            _id: comments[count]._id,
// 										                            user: user.name,
// 										                            image: user.image,
// 										                            medium: user.medium
// 										                          };

// 										                          commentData.push(dic);
// 										                        if(count < comments.length - 1){
// 										                          count = count + 1;
// 										                          getCommentUserDetails();
// 										                        }else{
// 										                        	var web_link = doc[counter].web_link;
// 										                        	if(errors.indexOf(doc[counter].web_link) == -1){
// 															            if(youtube_parser(doc[counter].web_link) != false){
// 															              web_link = getId(doc[counter].web_link);

// 															            }
// 															        }
// 															        var r = ('' + doc[counter].web_link).match(/^(https?:)?\/\/[^/]+/i);
// 										                          dict = {

// 										                            _id: doc[counter]._id,
// 																	title: doc[counter].title,
// 																	type: doc[counter].type,
// 																	description: doc[counter].description,
// 																	category: cat == null  ? '' :  cat.name,
// 																	platform: plat == null  ? '' :  plat.name,
// 																	sub_category: sub_cat == null  ? '' :  sub_cat.name,
// 																	web_link: web_link,
// 																	link : r ? r[0] : '',
// 																	user_id: doc[counter].user_id,
// 																	formatted_date: doc[counter].formatted_date,
// 										                            created_at: doc[counter].created_at,
// 										                            image: doc[counter].image,
// 										                            add_user_type: doc[counter].add_user_type,
// 										                            web_link_content: doc[counter].web_link_content,
// 										                            likes: like,
// 										                            dislikes: dislike,
// 										                            comments: commentData.length == 0 ? null : commentData[commentData.length - 1],
// 										                            comment_count: commentData.length,
// 				        											like_count: like.length,
// 										                            user_name: getname('name', doc1, admindoc),
// 												                    user_image: getname('image', doc1, admindoc),
// 												                    user_medium: getname('medium', doc1, admindoc),
// 												                    fav: errors.indexOf(favour) == -1 ? '1' : '0'

// 										                          };
// 									                          		//data.push(dict);
// 									                          		//var index = data.findIndex(x => x._id === dict._id);
// 									                          		var index = data.some(person => person._id === dict._id);
// 									                          		console.log('data = ', data)
// 									                          		console.log('index comment length greater than 0 = ', index)
// 									                          		if(followuser != null  && index == false){
// 																		data.push(dict);
// 																	}

// 																	index = data.some(person => person._id === dict._id);

// 																	if(followcat != null  && index == false){
// 																		data.push(dict);
// 																	}

// 																	index = data.some(person => person._id === dict._id);

// 										                          	if(followsubcat != null  && index == false){
// 																		data.push(dict);
// 																	}

// 										                          counter += 1;
// 										                          getUserDetails();
// 										                        }

// 										                      });
// 										                    }

// 										                    if(comments.length == 0){
// 										                    	var web_link = doc[counter].web_link;
// 									                        	if(errors.indexOf(doc[counter].web_link) == -1){
// 														            if(youtube_parser(doc[counter].web_link) != false){
// 														              web_link = getId(doc[counter].web_link);

// 														            }
// 														         }
// 														         var r = ('' + doc[counter].web_link).match(/^(https?:)?\/\/[^/]+/i);
// 										                    	dict = {
// 										                            _id: doc[counter]._id,
// 										                            title: doc[counter].title,
// 																	type: doc[counter].type,
// 																	description: doc[counter].description,
// 																	category: cat == null ? '' : cat.name,
// 																	platform: plat == null  ? '' :  plat.name,
// 																	sub_category: sub_cat == null ? '' : sub_cat.name,
// 																	category_id: doc[counter].category,
// 																	sub_category_id: doc[counter].sub_category,
// 																	web_link: web_link,
// 																	link : r ? r[0] : '',
// 																	user_id: doc[counter].user_id,
// 																	formatted_date: doc[counter].formatted_date,
// 																	add_user_type: doc[counter].add_user_type,
// 																	web_link_content: doc[counter].web_link_content,
// 										                            created_at: doc[counter].created_at,
// 										                            image: errors.indexOf(doc[counter].image) >= 0 ? '' : doc[counter].image ,
// 										                            likes: like,
// 										                            dislikes: dislike,
// 										                            comments: commentData.length == 0 ? null : commentData[commentData.length - 1],
// 										                            comment_count: commentData.length,
// 				        											like_count: like.length,
// 										                      //       user_name: errors.indexOf(doc1) == -1 ? doc1.name :'',
// 												                    // user_image: errors.indexOf(doc1) == -1 ? doc1.image : '',
// 												                    // user_medium: errors.indexOf(doc1) == -1 ? doc1.medium : '',
// 												                    user_name: getname('name', doc1, admindoc),
// 												                    user_image: getname('image', doc1, admindoc),
// 												                    user_medium: getname('medium', doc1, admindoc),
// 												                    fav: errors.indexOf(favour) == -1 ? '1' : '0'

// 										                        };
// 										                        // data.push(dict);
// 									                         	var index = data.some(person => person._id === dict._id);
// 									                         	console.log('data comment length equasl to 0 = ', data)
// 									                         	console.log('index comment length equasl to 0 = ', index)
// 								                          		if(followuser != null  && index == false){
// 																	data.push(dict);
// 																}
// 																index = data.some(person => person._id === dict._id);
// 																if(followcat != null  && index == false){
// 																	data.push(dict);
// 																}
// 																index = data.some(person => person._id === dict._id);
// 									                          	if(followsubcat != null  && index == false){
// 																	data.push(dict);
// 																}

// 									                          	counter += 1;
// 									                          	getUserDetails();
// 									                      	}else{
// 									                      		getCommentUserDetails();
// 									                      	}
// 										                    // getCommentUserDetails();
// 										                });
// 													});
// 												});
// 											});
// 										});

// 									});
// 			                    });
// 			                });
// 		               	 	});
// 						});
// 	              	});
// 	            });
// 	          // }else{
// 	          //   counter += 1;
// 	          //   // getUserDetails();
// 	          // }

// 	          // getUserDetails();
// 	        }else{

// 	        	var result = arraySort(data, ['like_count', 'comment_count']);
// 	          	res.send({
// 		            error: null,
// 		            status: 1,
// 		            data: result
// 	          	});
//         	}
//       	};
//       	getUserDetails();

//     });
// }

exports.get_saved_recc = function (req, res) {
  var pageNo = parseInt(req.body.skip);
  var size = parseInt(req.body.limit);
  var skip = size * (pageNo - 1);
  var all_recc = [],
    dict = {},
    data = [];
  var counter = 0,
    latest_counter = 0;
  var query = {};
  query = { category: { $in: req.body.filter_cat_array_global } };
  var pageNo = parseInt(req.body.skip);
  var size = parseInt(req.body.limit);
  var skip = size * (pageNo - 1);
  reccomandation
    .find() /*.limit(size).skip(skip)*/
    .sort({ like_count: -1, comment_count: -1, created_at: -1 })
    .exec(function (err, doc) {
      var counter = 0,
        dict = {},
        data = [];
      function getUserDetails() {
        if (counter < doc.length) {
          // if(typeof(doc[counter].userId) != 'undefined'){
          users.findOne({ _id: doc[counter].user_id }, function (err, doc1) {
            likes.find({ postId: doc[counter]._id }, function (err, like) {
              dislikes.find(
                { postId: doc[counter]._id },
                function (err, dislike) {
                  comments.find(
                    { postId: doc[counter]._id },
                    function (err, comments) {
                      favourites.findOne(
                        {
                          recc_id: doc[counter]._id,
                          user_id: req.body.user_id,
                        },
                        null,
                        function (err, favour) {
                          categories.findOne(
                            { _id: doc[counter].category },
                            null,
                            function (err, cat) {
                              plaform.findOne(
                                { _id: doc[counter].platform },
                                null,
                                function (err, plat) {
                                  subcategories.findOne(
                                    { _id: doc[counter].sub_category },
                                    null,
                                    function (err, sub_cat) {
                                      admin.findOne(
                                        {},
                                        function (err, admindoc) {
                                          var count = 0,
                                            dic = {},
                                            commentData = [];
                                          function getname(str, user, admin) {
                                            //console.log('user saved', user)
                                            if (str == "name") {
                                              if (
                                                doc[counter].add_user_type ==
                                                "user"
                                              ) {
                                                if (
                                                  errors.indexOf(user) == -1
                                                ) {
                                                  return user.name;
                                                } else {
                                                  return "";
                                                }
                                              } else {
                                                if (
                                                  errors.indexOf(admindoc) == -1
                                                ) {
                                                  return admindoc.firstname;
                                                } else {
                                                  return "";
                                                }
                                              }
                                            } else if (str == "image") {
                                              if (
                                                doc[counter].add_user_type ==
                                                "user"
                                              ) {
                                                if (
                                                  errors.indexOf(user) == -1
                                                ) {
                                                  return user.image;
                                                } else {
                                                  return "";
                                                }
                                              } else {
                                                if (
                                                  errors.indexOf(admindoc) == -1
                                                ) {
                                                  return admindoc.image;
                                                } else {
                                                  return "";
                                                }
                                              }
                                            } else {
                                              if (errors.indexOf(user) == -1) {
                                                return user.medium;
                                              } else {
                                                return "";
                                              }
                                            }
                                          }
                                          function getCommentUserDetails() {
                                            users.findOne(
                                              { _id: comments[count].userId },
                                              function (err, user) {
                                                dic = {
                                                  comment:
                                                    comments[count].comment,
                                                  postId:
                                                    comments[count].postId,
                                                  userId:
                                                    comments[count].userId,
                                                  _id: comments[count]._id,
                                                  user: user.name,
                                                  image: user.image,
                                                  medium: user.medium,
                                                };
                                                commentData.push(dic);

                                                if (
                                                  count <
                                                  comments.length - 1
                                                ) {
                                                  count = count + 1;
                                                  getCommentUserDetails();
                                                } else {
                                                  var web_link =
                                                    doc[counter].web_link;
                                                  if (
                                                    errors.indexOf(
                                                      doc[counter].web_link
                                                    ) == -1
                                                  ) {
                                                    if (
                                                      youtube_parser(
                                                        doc[counter].web_link
                                                      ) != false
                                                    ) {
                                                      web_link = getId(
                                                        doc[counter].web_link
                                                      );
                                                    }
                                                  }
                                                  var r = (
                                                    "" + doc[counter].web_link
                                                  ).match(
                                                    /^(https?:)?\/\/[^/]+/i
                                                  );
                                                  dict = {
                                                    _id: doc[counter]._id,
                                                    title: doc[counter].title,
                                                    type: doc[counter].type,
                                                    description:
                                                      doc[counter].description,
                                                    category:
                                                      cat == null
                                                        ? ""
                                                        : cat.name,
                                                    platform:
                                                      plat == null
                                                        ? ""
                                                        : plat.name,
                                                    sub_category:
                                                      sub_cat == null
                                                        ? ""
                                                        : sub_cat.name,
                                                    web_link: web_link,
                                                    link: r ? r[0] : "",
                                                    user_id:
                                                      doc[counter].user_id,
                                                    formatted_date:
                                                      doc[counter]
                                                        .formatted_date,
                                                    created_at:
                                                      doc[counter].created_at,
                                                    image: doc[counter].image,
                                                    add_user_type:
                                                      doc[counter]
                                                        .add_user_type,
                                                    web_link_content:
                                                      doc[counter]
                                                        .web_link_content,
                                                    recc_contact:
                                                      doc[counter].recc_contact,
                                                    tags: doc[counter].tags,
                                                    likes: like,
                                                    dislikes: dislike,
                                                    comments:
                                                      commentData.length == 0
                                                        ? null
                                                        : commentData[
                                                            commentData.length -
                                                              1
                                                          ],
                                                    comment_count:
                                                      commentData.length,
                                                    like_count: like.length,
                                                    user_name: getname(
                                                      "name",
                                                      doc1,
                                                      admindoc
                                                    ),
                                                    user_image: getname(
                                                      "image",
                                                      doc1,
                                                      admindoc
                                                    ),
                                                    user_medium: getname(
                                                      "medium",
                                                      doc1,
                                                      admindoc
                                                    ),
                                                    fav:
                                                      errors.indexOf(favour) ==
                                                      -1
                                                        ? "1"
                                                        : "0",
                                                    location:
                                                      doc[counter].location,
                                                    lat: doc[counter].lat,
                                                    long: doc[counter].long,
                                                    cords: doc[counter].cords,
                                                    recc_type:
                                                      doc[counter].recc_type,
                                                    recc_contact:
                                                      doc[counter].recc_contact,
                                                    tags: doc[counter].tags,
                                                  };
                                                  if (
                                                    errors.indexOf(favour) == -1
                                                  ) {
                                                    data.push(dict);
                                                  }
                                                  // data.push(dict);
                                                  counter += 1;
                                                  getUserDetails();
                                                }
                                              }
                                            );
                                          }

                                          if (comments.length == 0) {
                                            var web_link =
                                              doc[counter].web_link;
                                            if (
                                              errors.indexOf(
                                                doc[counter].web_link
                                              ) == -1
                                            ) {
                                              if (
                                                youtube_parser(
                                                  doc[counter].web_link
                                                ) != false
                                              ) {
                                                web_link = getId(
                                                  doc[counter].web_link
                                                );
                                              }
                                            }
                                            var r = (
                                              "" + doc[counter].web_link
                                            ).match(/^(https?:)?\/\/[^/]+/i);
                                            dict = {
                                              _id: doc[counter]._id,
                                              title: doc[counter].title,
                                              type: doc[counter].type,
                                              description:
                                                doc[counter].description,
                                              category:
                                                cat == null ? "" : cat.name,
                                              platform:
                                                plat == null ? "" : plat.name,
                                              sub_category:
                                                sub_cat == null
                                                  ? ""
                                                  : sub_cat.name,
                                              category_id:
                                                doc[counter].category,
                                              sub_category_id:
                                                doc[counter].sub_category,
                                              web_link: web_link,
                                              link: r ? r[0] : "",
                                              user_id: doc[counter].user_id,
                                              formatted_date:
                                                doc[counter].formatted_date,
                                              recc_contact:
                                                doc[counter].recc_contact,
                                              tags: doc[counter].tags,
                                              add_user_type:
                                                doc[counter].add_user_type,
                                              web_link_content:
                                                doc[counter].web_link_content,
                                              created_at:
                                                doc[counter].created_at,
                                              image:
                                                errors.indexOf(
                                                  doc[counter].image
                                                ) >= 0
                                                  ? ""
                                                  : doc[counter].image,
                                              likes: like,
                                              dislikes: dislike,
                                              comments:
                                                commentData.length == 0
                                                  ? null
                                                  : commentData[
                                                      commentData.length - 1
                                                    ],
                                              comment_count: commentData.length,
                                              like_count: like.length,
                                              //       user_name: errors.indexOf(doc1) == -1 ? doc1.name :'',
                                              // user_image: errors.indexOf(doc1) == -1 ? doc1.image : '',
                                              // user_medium: errors.indexOf(doc1) == -1 ? doc1.medium : '',
                                              user_name: getname(
                                                "name",
                                                doc1,
                                                admindoc
                                              ),
                                              user_image: getname(
                                                "image",
                                                doc1,
                                                admindoc
                                              ),
                                              user_medium: getname(
                                                "medium",
                                                doc1,
                                                admindoc
                                              ),
                                              fav:
                                                errors.indexOf(favour) == -1
                                                  ? "1"
                                                  : "0",
                                              location: doc[counter].location,
                                              lat: doc[counter].lat,
                                              long: doc[counter].long,
                                              cords: doc[counter].cords,
                                              recc_type: doc[counter].recc_type,
                                              recc_contact:
                                                doc[counter].recc_contact,
                                              tags: doc[counter].tags,
                                            };
                                            if (favour != null) {
                                              data.push(dict);
                                            }
                                            // data.push(dict);
                                            counter += 1;
                                            getUserDetails();
                                          } else {
                                            getCommentUserDetails();
                                          }
                                        }
                                      );
                                    }
                                  );
                                }
                              );
                            }
                          );
                        }
                      );
                    }
                  );
                }
              );
            });
          });
        } else {
          res.send({
            error: null,
            status: 1,
            data: data,
          });
        }
      }
      getUserDetails();
    });
};

exports.get_all_recc = function (req, res) {
  var pageNo = parseInt(req.body.skip);
  var size = parseInt(req.body.limit);
  var skip = size * (pageNo - 1);
  var all_recc = [],
    dict = {},
    data = [];
  var counter = 0,
    latest_counter = 0;
  var query = {};
  if (req.body.cat == "All") {
    if (req.body.filter_cat_array.length > 0) {
      query = {
        recc_type: "global",
        category: { $in: req.body.filter_cat_array },
      };
    }
  } else {
    query = { category: req.body.cat };
  }
  var follow_cat_subcat_array = [],
    follow_cat_subcat_ids_array = [],
    cat_counter = 0,
    subcat_counter = 0,
    user_counter = 0;
  try {
    if (req.body.type == "Basic") {
      categoryfollow.find(
        { user_id: req.body.user_id },
        null,
        function (err, followcat) {
          // console.log('cat_counter = ', cat_counter);
          if (followcat.length > 0) {
            followcat.forEach(function (item) {
              follow_cat_subcat_array.push(item);
              cat_counter = cat_counter + 1;
              // console.log('follow_cat_subcat_array = ', follow_cat_subcat_array, cat_counter);
              if (cat_counter == followcat.length) {
                subcategoryfollow.find(
                  { user_id: req.body.user_id },
                  null,
                  function (err, followsubcat) {
                    if (followsubcat.length > 0) {
                      followsubcat.forEach(function (item1) {
                        follow_cat_subcat_array.push(item1);
                        subcat_counter = subcat_counter + 1;
                        if (subcat_counter == followsubcat.length) {
                          // console.log('follow_cat_subcat_array = ', follow_cat_subcat_array);
                          friends.find(
                            { userId: req.body.user_id },
                            null,
                            function (err, followuser) {
                              if (followuser.length > 0) {
                                followuser.forEach(function (item2) {
                                  follow_cat_subcat_array.push(item2);
                                  user_counter = user_counter + 1;
                                  if (user_counter == followuser.length) {
                                    follow_cat_subcat_array.forEach(function (
                                      value
                                    ) {
                                      if (errors.indexOf(value.cat_id) == -1)
                                        follow_cat_subcat_ids_array.push(
                                          value.cat_id
                                        );
                                      if (
                                        errors.indexOf(value.sub_cat_id) == -1
                                      )
                                        follow_cat_subcat_ids_array.push(
                                          value.sub_cat_id
                                        );

                                      if (errors.indexOf(value.friendId) == -1)
                                        follow_cat_subcat_ids_array.push(
                                          value.friendId
                                        );
                                    });
                                    reccomandation
                                      .find({
                                        // recc_type: "global",
                                        $or: [
                                          {
                                            user_id: {
                                              $in: follow_cat_subcat_ids_array,
                                            },
                                          },
                                          {
                                            category: {
                                              $in: follow_cat_subcat_ids_array,
                                            },
                                          },
                                          {
                                            sub_category: {
                                              $in: follow_cat_subcat_ids_array,
                                            },
                                          },
                                        ],
                                      })
                                      .sort({
                                        like_count: -1,
                                        comment_count: -1,
                                        created_at: -1,
                                      })
                                      .exec(function (err, doc) {
                                        // all_recc.concat(doc);
                                        all_recc = [...all_recc, ...doc];
                                        getdata(doc);
                                        // latest_counter = latest_counter + 1;
                                        // console.log('all_recc = ', all_recc);

                                        // console.log('latest_counter = ', latest_counter);
                                        if (
                                          latest_counter ==
                                          follow_cat_subcat_array.length
                                        ) {
                                          // console.log('cat_counter = ', cat_counter);
                                          // console.log('subcat_counter = ', subcat_counter);
                                          // console.log('followcat = ', followcat);
                                          // console.log('followsubcat = ', followsubcat);
                                          // console.log('follow_cat_subcat_array = ', follow_cat_subcat_array, follow_cat_subcat_array.length);
                                          // return;
                                        }
                                      });
                                  }
                                });
                              } else {
                                follow_cat_subcat_array.forEach(function (
                                  value
                                ) {
                                  if (errors.indexOf(value.cat_id) == -1)
                                    follow_cat_subcat_ids_array.push(
                                      value.cat_id
                                    );

                                  if (errors.indexOf(value.sub_cat_id) == -1)
                                    follow_cat_subcat_ids_array.push(
                                      value.sub_cat_id
                                    );

                                  if (errors.indexOf(value.friendId) == -1)
                                    follow_cat_subcat_ids_array.push(
                                      value.friendId
                                    );
                                });
                                reccomandation
                                  .find({
                                    // recc_type: "global",
                                    $or: [
                                      {
                                        user_id: {
                                          $in: follow_cat_subcat_ids_array,
                                        },
                                      },
                                      {
                                        category: {
                                          $in: follow_cat_subcat_ids_array,
                                        },
                                      },
                                      {
                                        sub_category: {
                                          $in: follow_cat_subcat_ids_array,
                                        },
                                      },
                                    ],
                                  })
                                  .sort({
                                    like_count: -1,
                                    comment_count: -1,
                                    created_at: -1,
                                  })
                                  .exec(function (err, doc) {
                                    // all_recc.concat(doc);
                                    all_recc = [...all_recc, ...doc];
                                    getdata(doc);
                                    // latest_counter = latest_counter + 1;
                                    // console.log('all_recc = ', all_recc);

                                    // console.log('latest_counter = ', latest_counter);
                                    if (
                                      latest_counter ==
                                      follow_cat_subcat_array.length
                                    ) {
                                      // console.log('cat_counter = ', cat_counter);
                                      // console.log('subcat_counter = ', subcat_counter);
                                      // console.log('followcat = ', followcat);
                                      // console.log('followsubcat = ', followsubcat);
                                      // console.log('follow_cat_subcat_array = ', follow_cat_subcat_array, follow_cat_subcat_array.length);
                                      // return;
                                    }
                                  });
                              }
                            }
                          );
                        }
                      });
                    } else {
                      friends.find(
                        { userId: req.body.user_id },
                        null,
                        function (err, followuser) {
                          console.log("followuser = ", followuser);
                          if (followuser.length > 0) {
                            followuser.forEach(function (item2) {
                              follow_cat_subcat_array.push(item2);
                              user_counter = user_counter + 1;
                              if (user_counter == followuser.length) {
                                console.log("user_counter = ", user_counter);
                                follow_cat_subcat_array.forEach(function (
                                  value
                                ) {
                                  if (errors.indexOf(value.cat_id) == -1)
                                    follow_cat_subcat_ids_array.push(
                                      value.cat_id
                                    );

                                  if (errors.indexOf(value.sub_cat_id) == -1)
                                    follow_cat_subcat_ids_array.push(
                                      value.sub_cat_id
                                    );

                                  if (errors.indexOf(value.friendId) == -1)
                                    follow_cat_subcat_ids_array.push(
                                      value.friendId
                                    );
                                });
                                reccomandation
                                  .find({
                                    // recc_type: "global",
                                    $or: [
                                      {
                                        user_id: {
                                          $in: follow_cat_subcat_ids_array,
                                        },
                                      },
                                      {
                                        category: {
                                          $in: follow_cat_subcat_ids_array,
                                        },
                                      },
                                      {
                                        sub_category: {
                                          $in: follow_cat_subcat_ids_array,
                                        },
                                      },
                                    ],
                                  })
                                  .sort({
                                    like_count: -1,
                                    comment_count: -1,
                                    created_at: -1,
                                  })
                                  .exec(function (err, doc) {
                                    console.log("doc = ", doc);
                                    // all_recc.concat(doc);
                                    all_recc = [...all_recc, ...doc];
                                    getdata(doc);
                                    // latest_counter = latest_counter + 1;
                                    // console.log('all_recc = ', all_recc);

                                    // console.log('latest_counter = ', latest_counter);
                                    if (
                                      latest_counter ==
                                      follow_cat_subcat_array.length
                                    ) {
                                      // console.log('cat_counter = ', cat_counter);
                                      // console.log('subcat_counter = ', subcat_counter);
                                      // console.log('followcat = ', followcat);
                                      // console.log('followsubcat = ', followsubcat);
                                      // console.log('follow_cat_subcat_array = ', follow_cat_subcat_array, follow_cat_subcat_array.length);
                                      // return;
                                    }
                                  });
                              }
                            });
                          } else {
                            follow_cat_subcat_array.forEach(function (value) {
                              if (errors.indexOf(value.cat_id) == -1)
                                follow_cat_subcat_ids_array.push(value.cat_id);

                              if (errors.indexOf(value.sub_cat_id) == -1)
                                follow_cat_subcat_ids_array.push(
                                  value.sub_cat_id
                                );

                              if (errors.indexOf(value.friendId) == -1)
                                follow_cat_subcat_ids_array.push(
                                  value.friendId
                                );
                            });
                            reccomandation
                              .find({
                                // recc_type: "global",
                                $or: [
                                  {
                                    user_id: {
                                      $in: follow_cat_subcat_ids_array,
                                    },
                                  },
                                  {
                                    category: {
                                      $in: follow_cat_subcat_ids_array,
                                    },
                                  },
                                  {
                                    sub_category: {
                                      $in: follow_cat_subcat_ids_array,
                                    },
                                  },
                                ],
                              })
                              .sort({
                                like_count: -1,
                                comment_count: -1,
                                created_at: -1,
                              })
                              .exec(function (err, doc) {
                                console.log("doc = ", doc);
                                // all_recc.concat(doc);
                                all_recc = [...all_recc, ...doc];
                                getdata(doc);
                                // latest_counter = latest_counter + 1;
                                // console.log('all_recc = ', all_recc);

                                // console.log('latest_counter = ', latest_counter);
                                if (
                                  latest_counter ==
                                  follow_cat_subcat_array.length
                                ) {
                                  // console.log('cat_counter = ', cat_counter);
                                  // console.log('subcat_counter = ', subcat_counter);
                                  // console.log('followcat = ', followcat);
                                  // console.log('followsubcat = ', followsubcat);
                                  // console.log('follow_cat_subcat_array = ', follow_cat_subcat_array, follow_cat_subcat_array.length);
                                  // return;
                                }
                              });
                          }
                        }
                      );
                    }
                  }
                );
              }
            });
          } else {
            subcategoryfollow.find(
              { user_id: req.body.user_id },
              null,
              function (err, followsubcat) {
                console.log("followsubcat = ", followsubcat);
                if (followsubcat.length > 0) {
                  followsubcat.forEach(function (item1) {
                    follow_cat_subcat_array.push(item1);
                    subcat_counter = subcat_counter + 1;
                    if (subcat_counter == followsubcat.length) {
                      friends.find(
                        { user_id: req.body.user_id },
                        null,
                        function (err, followuser) {
                          if (followuser.length > 0) {
                            followuser.forEach(function (item2) {
                              follow_cat_subcat_array.push(item2);
                              user_counter = user_counter + 1;
                              if (user_counter == followuser.length) {
                                follow_cat_subcat_array.forEach(function (
                                  value
                                ) {
                                  if (errors.indexOf(value.cat_id) == -1)
                                    follow_cat_subcat_ids_array.push(
                                      value.cat_id
                                    );

                                  if (errors.indexOf(value.sub_cat_id) == -1)
                                    follow_cat_subcat_ids_array.push(
                                      value.sub_cat_id
                                    );

                                  if (errors.indexOf(value.friendId) == -1)
                                    follow_cat_subcat_ids_array.push(
                                      value.friendId
                                    );
                                });
                                reccomandation
                                  .find({
                                    // recc_type: "global",
                                    $or: [
                                      {
                                        user_id: {
                                          $in: follow_cat_subcat_ids_array,
                                        },
                                      },
                                      {
                                        category: {
                                          $in: follow_cat_subcat_ids_array,
                                        },
                                      },
                                      {
                                        sub_category: {
                                          $in: follow_cat_subcat_ids_array,
                                        },
                                      },
                                    ],
                                  })
                                  .sort({
                                    like_count: -1,
                                    comment_count: -1,
                                    created_at: -1,
                                  })
                                  .exec(function (err, doc) {
                                    console.log("doc = ", doc);
                                    // all_recc.concat(doc);
                                    all_recc = [...all_recc, ...doc];
                                    getdata(doc);
                                    latest_counter = latest_counter + 1;
                                    // console.log('all_recc = ', all_recc);

                                    // console.log('latest_counter = ', latest_counter);
                                    if (
                                      latest_counter ==
                                      follow_cat_subcat_array.length
                                    ) {
                                      // console.log('cat_counter = ', cat_counter);
                                      // console.log('subcat_counter = ', subcat_counter);
                                      // console.log('followcat = ', followcat);
                                      // console.log('followsubcat = ', followsubcat);
                                      // console.log('follow_cat_subcat_array = ', follow_cat_subcat_array, follow_cat_subcat_array.length);
                                      // return;
                                    }
                                  });
                              }
                            });
                          } else {
                            follow_cat_subcat_array.forEach(function (value) {
                              if (errors.indexOf(value.cat_id) == -1)
                                follow_cat_subcat_ids_array.push(value.cat_id);

                              if (errors.indexOf(value.sub_cat_id) == -1)
                                follow_cat_subcat_ids_array.push(
                                  value.sub_cat_id
                                );

                              if (errors.indexOf(value.friendId) == -1)
                                follow_cat_subcat_ids_array.push(
                                  value.friendId
                                );
                            });
                            reccomandation
                              .find({
                                // recc_type: "global",
                                $or: [
                                  {
                                    user_id: {
                                      $in: follow_cat_subcat_ids_array,
                                    },
                                  },
                                  {
                                    category: {
                                      $in: follow_cat_subcat_ids_array,
                                    },
                                  },
                                  {
                                    sub_category: {
                                      $in: follow_cat_subcat_ids_array,
                                    },
                                  },
                                ],
                              })
                              .sort({
                                like_count: -1,
                                comment_count: -1,
                                created_at: -1,
                              })
                              .exec(function (err, doc) {
                                console.log("doc = ", doc);
                                // all_recc.concat(doc);
                                all_recc = [...all_recc, ...doc];
                                getdata(doc);
                                latest_counter = latest_counter + 1;
                                // console.log('all_recc = ', all_recc);

                                // console.log('latest_counter = ', latest_counter);
                                if (
                                  latest_counter ==
                                  follow_cat_subcat_array.length
                                ) {
                                  // console.log('cat_counter = ', cat_counter);
                                  // console.log('subcat_counter = ', subcat_counter);
                                  // console.log('followcat = ', followcat);
                                  // console.log('followsubcat = ', followsubcat);
                                  // console.log('follow_cat_subcat_array = ', follow_cat_subcat_array, follow_cat_subcat_array.length);
                                  // return;
                                }
                              });
                          }
                        }
                      );
                    }
                  });
                } else {
                  friends.find(
                    { userId: req.body.user_id },
                    null,
                    function (err, followuser) {
                      if (followuser.length > 0) {
                        followuser.forEach(function (item2) {
                          follow_cat_subcat_array.push(item2);
                          user_counter = user_counter + 1;
                          if (user_counter == followuser.length) {
                            follow_cat_subcat_array.forEach(function (value) {
                              if (errors.indexOf(value.cat_id) == -1)
                                follow_cat_subcat_ids_array.push(value.cat_id);

                              if (errors.indexOf(value.sub_cat_id) == -1)
                                follow_cat_subcat_ids_array.push(
                                  value.sub_cat_id
                                );

                              if (errors.indexOf(value.friendId) == -1)
                                follow_cat_subcat_ids_array.push(
                                  value.friendId
                                );
                            });
                            reccomandation
                              .find({
                                // recc_type: "global",
                                $or: [
                                  {
                                    user_id: {
                                      $in: follow_cat_subcat_ids_array,
                                    },
                                  },
                                  {
                                    category: {
                                      $in: follow_cat_subcat_ids_array,
                                    },
                                  },
                                  {
                                    sub_category: {
                                      $in: follow_cat_subcat_ids_array,
                                    },
                                  },
                                ],
                              })
                              .sort({
                                like_count: -1,
                                comment_count: -1,
                                created_at: -1,
                              })
                              .exec(function (err, doc) {
                                console.log("doc = ", doc);
                                // all_recc.concat(doc);
                                all_recc = [...all_recc, ...doc];
                                latest_counter = latest_counter + 1;
                                getdata(doc);
                                // console.log('all_recc = ', all_recc);

                                // console.log('latest_counter = ', latest_counter);
                                if (
                                  latest_counter ==
                                  follow_cat_subcat_array.length
                                ) {
                                  // console.log('cat_counter = ', cat_counter);
                                  // console.log('subcat_counter = ', subcat_counter);
                                  // console.log('followcat = ', followcat);
                                  // console.log('followsubcat = ', followsubcat);
                                  // console.log('follow_cat_subcat_array = ', follow_cat_subcat_array, follow_cat_subcat_array.length);
                                  // return;
                                }
                              });
                          }
                        });
                      } else {
                        res.send({
                          error: null,
                          status: 1,
                          data: [],
                        });
                      }
                    }
                  );
                }
              }
            );
          }
        }
      );

      function getdata(doc) {
        console.log(doc[counter]);
        if (counter < doc.length) {
          // if(typeof(doc[counter].userId) != 'undefined'){

          users.findOne({ _id: doc[counter].user_id }, function (err, doc1) {
            likes.find({ postId: doc[counter]._id }, function (err, like) {
              dislikes.find(
                { postId: doc[counter]._id },
                function (err, dislike) {
                  comments.find(
                    { postId: doc[counter]._id },
                    function (err, comments) {
                      favourites.findOne(
                        {
                          recc_id: doc[counter]._id,
                          user_id: req.body.user_id,
                        },
                        null,
                        function (err, favour) {
                          categories.findOne(
                            { _id: doc[counter].category },
                            null,
                            function (err, cat) {
                              plaform.findOne(
                                { _id: doc[counter].platform },
                                null,
                                function (err, plat) {
                                  subcategories.findOne(
                                    { _id: doc[counter].sub_category },
                                    null,
                                    function (err, sub_cat) {
                                      categoryfollow.findOne(
                                        {
                                          cat_id: doc[counter].category,
                                          user_id: req.body.user_id,
                                        },
                                        null,
                                        function (err, followcat) {
                                          // console.log('followcat = ', followcat);

                                          subcategoryfollow.findOne(
                                            {
                                              sub_cat_id:
                                                doc[counter].sub_category,
                                              user_id: req.body.user_id,
                                            },
                                            null,
                                            function (err, followsubcat) {
                                              // console.log('followsubcat = ', followsubcat);

                                              friends.findOne(
                                                {
                                                  friendId:
                                                    doc[counter].user_id,
                                                  userId: req.body.user_id,
                                                },
                                                null,
                                                function (err, followuser) {
                                                  // console.log('followuser = ', followuser);
                                                  admin.findOne(
                                                    {},
                                                    function (err, admindoc) {
                                                      var count = 0,
                                                        dic = {},
                                                        commentData = [];

                                                      function getname(
                                                        str,
                                                        user,
                                                        admin
                                                      ) {
                                                        if (str == "name") {
                                                          if (
                                                            doc[counter]
                                                              .add_user_type ==
                                                            "user"
                                                          ) {
                                                            if (
                                                              errors.indexOf(
                                                                user
                                                              ) == -1
                                                            ) {
                                                              return user.name;
                                                            } else {
                                                              return "";
                                                            }
                                                          } else {
                                                            if (
                                                              errors.indexOf(
                                                                admindoc
                                                              ) == -1
                                                            ) {
                                                              return admindoc.firstname;
                                                            } else {
                                                              return "";
                                                            }
                                                          }
                                                        } else if (
                                                          str == "image"
                                                        ) {
                                                          if (
                                                            doc[counter]
                                                              .add_user_type ==
                                                            "user"
                                                          ) {
                                                            if (
                                                              errors.indexOf(
                                                                user
                                                              ) == -1
                                                            ) {
                                                              return user.image;
                                                            } else {
                                                              return "";
                                                            }
                                                          } else {
                                                            if (
                                                              errors.indexOf(
                                                                admindoc
                                                              ) == -1
                                                            ) {
                                                              return admindoc.image;
                                                            } else {
                                                              return "";
                                                            }
                                                          }
                                                        } else {
                                                          if (
                                                            errors.indexOf(
                                                              user
                                                            ) == -1
                                                          ) {
                                                            return user.medium;
                                                          } else {
                                                            return "";
                                                          }
                                                        }
                                                      }

                                                      function getCommentUserDetails() {
                                                        // users.findOne({'_id': doc[counter].user_id}, function(err, user){
                                                        //console.log('get all recc', count)
                                                        users.findOne(
                                                          {
                                                            _id: comments[count]
                                                              .userId,
                                                          },
                                                          function (err, user) {
                                                            // if(count < comments.length){
                                                            dic = {
                                                              comment:
                                                                comments[count]
                                                                  .comment,
                                                              postId:
                                                                comments[count]
                                                                  .postId,
                                                              userId:
                                                                comments[count]
                                                                  .userId,
                                                              _id: comments[
                                                                count
                                                              ]._id,
                                                              location:
                                                                doc[counter]
                                                                  .location,
                                                              user: user.name,
                                                              image: user.image,
                                                              medium:
                                                                user.medium,
                                                            };

                                                            commentData.push(
                                                              dic
                                                            );
                                                            if (
                                                              count <
                                                              comments.length -
                                                                1
                                                            ) {
                                                              count = count + 1;
                                                              getCommentUserDetails();
                                                            } else {
                                                              var web_link =
                                                                doc[counter]
                                                                  .web_link;
                                                              if (
                                                                errors.indexOf(
                                                                  doc[counter]
                                                                    .web_link
                                                                ) == -1
                                                              ) {
                                                                if (
                                                                  youtube_parser(
                                                                    doc[counter]
                                                                      .web_link
                                                                  ) != false
                                                                ) {
                                                                  web_link =
                                                                    getId(
                                                                      doc[
                                                                        counter
                                                                      ].web_link
                                                                    );
                                                                }
                                                              }
                                                              var r = (
                                                                "" +
                                                                doc[counter]
                                                                  .web_link
                                                              ).match(
                                                                /^(https?:)?\/\/[^/]+/i
                                                              );
                                                              dict = {
                                                                _id: doc[
                                                                  counter
                                                                ]._id,
                                                                title:
                                                                  doc[counter]
                                                                    .title,
                                                                type: doc[
                                                                  counter
                                                                ].type,
                                                                description:
                                                                  doc[counter]
                                                                    .description,
                                                                category:
                                                                  cat == null
                                                                    ? ""
                                                                    : cat.name,
                                                                platform:
                                                                  plat == null
                                                                    ? ""
                                                                    : plat.name,
                                                                sub_category:
                                                                  sub_cat ==
                                                                  null
                                                                    ? ""
                                                                    : sub_cat.name,
                                                                web_link:
                                                                  web_link,
                                                                location:
                                                                  doc[counter]
                                                                    .location,
                                                                link: r
                                                                  ? r[0]
                                                                  : "",
                                                                user_id:
                                                                  doc[counter]
                                                                    .user_id,
                                                                formatted_date:
                                                                  doc[counter]
                                                                    .formatted_date,
                                                                created_at:
                                                                  doc[counter]
                                                                    .created_at,
                                                                image:
                                                                  doc[counter]
                                                                    .image,
                                                                add_user_type:
                                                                  doc[counter]
                                                                    .add_user_type,
                                                                recc_type:
                                                                  doc[counter]
                                                                    .recc_type,
                                                                web_link_content:
                                                                  doc[counter]
                                                                    .web_link_content,
                                                                likes: like,
                                                                dislikes:
                                                                  dislike,
                                                                comments:
                                                                  commentData.length ==
                                                                  0
                                                                    ? null
                                                                    : commentData[
                                                                        commentData.length -
                                                                          1
                                                                      ],
                                                                comment_count:
                                                                  commentData.length,
                                                                like_count:
                                                                  like.length,
                                                                user_name:
                                                                  getname(
                                                                    "name",
                                                                    doc1,
                                                                    admindoc
                                                                  ),
                                                                user_image:
                                                                  getname(
                                                                    "image",
                                                                    doc1,
                                                                    admindoc
                                                                  ),
                                                                user_medium:
                                                                  getname(
                                                                    "medium",
                                                                    doc1,
                                                                    admindoc
                                                                  ),
                                                                fav:
                                                                  errors.indexOf(
                                                                    favour
                                                                  ) == -1
                                                                    ? "1"
                                                                    : "0",
                                                                tags: doc[
                                                                  counter
                                                                ].tags,
                                                              };
                                                              console.log(
                                                                "sdfdsfsdfs",
                                                                doc[counter]
                                                                  .tags
                                                              );
                                                              data.push(dict);

                                                              //var index = data.findIndex(x => x._id === dict._id);
                                                              var index =
                                                                data.some(
                                                                  (person) =>
                                                                    person._id ===
                                                                    dict._id
                                                                );
                                                              //console.log('data = ', data)
                                                              //console.log('index comment length greater than 0 = ', index)

                                                              //if(followuser != null  && index == false){
                                                              //data.push(dict);
                                                              //}

                                                              index = data.some(
                                                                (person) =>
                                                                  person._id ===
                                                                  dict._id
                                                              );

                                                              //if(followcat != null  && index == false){
                                                              //data.push(dict);
                                                              //}

                                                              index = data.some(
                                                                (person) =>
                                                                  person._id ===
                                                                  dict._id
                                                              );

                                                              //if(followsubcat != null  && index == false){
                                                              //data.push(dict);
                                                              //}

                                                              counter += 1;
                                                              getdata(doc);
                                                            }
                                                          }
                                                        );
                                                      }

                                                      if (
                                                        comments.length == 0
                                                      ) {
                                                        var web_link =
                                                          doc[counter].web_link;
                                                        if (
                                                          errors.indexOf(
                                                            doc[counter]
                                                              .web_link
                                                          ) == -1
                                                        ) {
                                                          if (
                                                            youtube_parser(
                                                              doc[counter]
                                                                .web_link
                                                            ) != false
                                                          ) {
                                                            web_link = getId(
                                                              doc[counter]
                                                                .web_link
                                                            );
                                                          }
                                                        }
                                                        var r = (
                                                          "" +
                                                          doc[counter].web_link
                                                        ).match(
                                                          /^(https?:)?\/\/[^/]+/i
                                                        );
                                                        dict = {
                                                          _id: doc[counter]._id,
                                                          title:
                                                            doc[counter].title,
                                                          type: doc[counter]
                                                            .type,
                                                          description:
                                                            doc[counter]
                                                              .description,
                                                          category:
                                                            cat == null
                                                              ? ""
                                                              : cat.name,
                                                          location:
                                                            doc[counter]
                                                              .location,
                                                          platform:
                                                            plat == null
                                                              ? ""
                                                              : plat.name,
                                                          sub_category:
                                                            sub_cat == null
                                                              ? ""
                                                              : sub_cat.name,
                                                          category_id:
                                                            doc[counter]
                                                              .category,
                                                          sub_category_id:
                                                            doc[counter]
                                                              .sub_category,
                                                          web_link: web_link,
                                                          link: r ? r[0] : "",
                                                          user_id:
                                                            doc[counter]
                                                              .user_id,
                                                          formatted_date:
                                                            doc[counter]
                                                              .formatted_date,
                                                          add_user_type:
                                                            doc[counter]
                                                              .add_user_type,
                                                          recc_type:
                                                            doc[counter]
                                                              .recc_type,
                                                          web_link_content:
                                                            doc[counter]
                                                              .web_link_content,
                                                          created_at:
                                                            doc[counter]
                                                              .created_at,
                                                          image:
                                                            errors.indexOf(
                                                              doc[counter].image
                                                            ) >= 0
                                                              ? ""
                                                              : doc[counter]
                                                                  .image,
                                                          likes: like,
                                                          dislikes: dislike,
                                                          comments:
                                                            commentData.length ==
                                                            0
                                                              ? null
                                                              : commentData[
                                                                  commentData.length -
                                                                    1
                                                                ],
                                                          comment_count:
                                                            commentData.length,
                                                          like_count:
                                                            like.length,
                                                          //       user_name: errors.indexOf(doc1) == -1 ? doc1.name :'',
                                                          // user_image: errors.indexOf(doc1) == -1 ? doc1.image : '',
                                                          // user_medium: errors.indexOf(doc1) == -1 ? doc1.medium : '',
                                                          user_name: getname(
                                                            "name",
                                                            doc1,
                                                            admindoc
                                                          ),
                                                          user_image: getname(
                                                            "image",
                                                            doc1,
                                                            admindoc
                                                          ),
                                                          user_medium: getname(
                                                            "medium",
                                                            doc1,
                                                            admindoc
                                                          ),
                                                          fav:
                                                            errors.indexOf(
                                                              favour
                                                            ) == -1
                                                              ? "1"
                                                              : "0",
                                                          recc_contact:
                                                            doc[counter]
                                                              .recc_contact,
                                                          tags: doc[counter]
                                                            .tags,
                                                        };
                                                        data.push(dict);
                                                        var index = data.some(
                                                          (person) =>
                                                            person._id ===
                                                            dict._id
                                                        );
                                                        //console.log('data comment length equasl to 0 = ', data)
                                                        //console.log('index comment length equasl to 0 = ', index)
                                                        //if(followuser != null  && index == false){
                                                        // data.push(dict);
                                                        // }
                                                        index = data.some(
                                                          (person) =>
                                                            person._id ===
                                                            dict._id
                                                        );
                                                        // if(followcat != null  && index == false){
                                                        // data.push(dict);
                                                        // }
                                                        index = data.some(
                                                          (person) =>
                                                            person._id ===
                                                            dict._id
                                                        );
                                                        // if(followsubcat != null  && index == false){
                                                        // data.push(dict);
                                                        // }

                                                        counter += 1;
                                                        getdata(doc);
                                                      } else {
                                                        getCommentUserDetails();
                                                      }
                                                      // getCommentUserDetails();
                                                    }
                                                  );
                                                }
                                              );
                                            }
                                          );
                                        }
                                      );
                                    }
                                  );
                                }
                              );
                            }
                          );
                        }
                      );
                    }
                  );
                }
              );
            });
          });

          // }else{
          //   counter += 1;
          //   // getUserDetails();
          // }

          // getUserDetails();
        } else {
          var result = arraySort(data, ["like_count", "comment_count"], {
            reverse: true,
          });
          res.send({
            error: null,
            status: 1,
            data: result,
          });
        }
      }

      // reccomandation.find(query)/*.limit(size).skip(skip)*/.sort({like_count: -1, comment_count: -1 ,created_at:-1}).limit(size).skip(skip).exec(function(err, doc) {
      //    	var counter = 0,
      //    	dict = {},
      //    	data = [];

      //    	function getUserDetails(){
      //       // console.log(doc[counter]);
      //       if(counter < doc.length){
      //         // if(typeof(doc[counter].userId) != 'undefined'){
      //           users.findOne({'_id': doc[counter].user_id}, function(err, doc1){
      //             	likes.find({'postId': doc[counter]._id}, function(err, like){
      //             		dislikes.find({'postId': doc[counter]._id}, function(err, dislike){
      //                	comments.find({'postId': doc[counter]._id}, function(err, comments){
      //                	favourites.findOne({recc_id: doc[counter]._id, user_id: req.body.user_id },null, function(err, favour) {
      //                		categories.findOne({_id: doc[counter].category },null, function(err, cat) {

      //                			plaform.findOne({_id: doc[counter].platform },null, function(err, plat) {

      //                 			subcategories.findOne({_id: doc[counter].sub_category },null, function(err, sub_cat) {

      // 	                			categoryfollow.findOne({cat_id: doc[counter].category , user_id: req.body.user_id},null, function(err, followcat) {

      // 	                				// console.log('followcat = ', followcat);

      // 									subcategoryfollow.findOne({sub_cat_id: doc[counter].sub_category , user_id: req.body.user_id},null, function(err, followsubcat) {

      // 										// console.log('followsubcat = ', followsubcat);

      // 										friends.findOne({friendId: doc[counter].user_id , userId: req.body.user_id},null, function(err, followuser) {

      // 											// console.log('followuser = ', followuser);
      // 				                			admin.findOne({}, function(err, admindoc){
      // 							                  	var count = 0,
      // 							                    dic= {},
      // 							                    commentData = [];

      // 							                    function getname(str, user, admin){
      // 							                    	if(str == 'name'){
      // 							                    		if(doc[counter].add_user_type == 'user'){
      // 								                    		if(errors.indexOf(user) == -1){
      // 									                    		return user.name;
      // 									                    	}else{
      // 									                    		return '';
      // 									                    	}
      // 								                    	}else{
      // 								                    		if(errors.indexOf(admindoc) == -1){
      // 									                    		return admindoc.firstname;
      // 									                    	}else{
      // 									                    		return '';
      // 									                    	}
      // 							                    		}
      // 							                    	}else if(str == 'image'){
      // 							                    		if(doc[counter].add_user_type == 'user'){
      // 								                    		if(errors.indexOf(user) == -1){
      // 									                    		return user.image;
      // 									                    	}else{
      // 									                    		return '';
      // 									                    	}
      // 								                    	}else{
      // 								                    		if(errors.indexOf(admindoc) == -1){
      // 									                    		return admindoc.image;
      // 									                    	}else{
      // 									                    		return '';
      // 									                    	}
      // 							                    		}
      // 							                    	}else{
      // 							                    		if(errors.indexOf(user) == -1){
      // 								                    		return user.medium;
      // 								                    	}else{
      // 								                    		return '';
      // 								                    	}
      // 							                    	}
      // 							                    }

      // 							                    function getCommentUserDetails(){
      // 							                      // users.findOne({'_id': doc[counter].user_id}, function(err, user){
      // 							                      	//console.log('get all recc', count)
      // 							                      	users.findOne({'_id': comments[count].userId}, function(err, user){
      // 							                        // if(count < comments.length){
      // 							                          dic = {
      // 							                            comment: comments[count].comment,
      // 							                            postId: comments[count].postId,
      // 							                            userId: comments[count].userId,
      // 							                            _id: comments[count]._id,
      // 							                            user: user.name,
      // 							                            image: user.image,
      // 							                            medium: user.medium
      // 							                          };

      // 							                          commentData.push(dic);
      // 							                        if(count < comments.length - 1){
      // 							                          count = count + 1;
      // 							                          getCommentUserDetails();
      // 							                        }else{
      // 							                        	var web_link = doc[counter].web_link;
      // 							                        	if(errors.indexOf(doc[counter].web_link) == -1){
      // 												            if(youtube_parser(doc[counter].web_link) != false){
      // 												              web_link = getId(doc[counter].web_link);

      // 												            }
      // 												        }
      // 												        var r = ('' + doc[counter].web_link).match(/^(https?:)?\/\/[^/]+/i);
      // 							                          dict = {

      // 							                            _id: doc[counter]._id,
      // 														title: doc[counter].title,
      // 														type: doc[counter].type,
      // 														description: doc[counter].description,
      // 														category: cat == null  ? '' :  cat.name,
      // 														platform: plat == null  ? '' :  plat.name,
      // 														sub_category: sub_cat == null  ? '' :  sub_cat.name,
      // 														web_link: web_link,
      // 														link : r ? r[0] : '',
      // 														user_id: doc[counter].user_id,
      // 														formatted_date: doc[counter].formatted_date,
      // 							                            created_at: doc[counter].created_at,
      // 							                            image: doc[counter].image,
      // 							                            add_user_type: doc[counter].add_user_type,
      // 							                            web_link_content: doc[counter].web_link_content,
      // 							                            likes: like,
      // 							                            dislikes: dislike,
      // 							                            comments: commentData.length == 0 ? null : commentData[commentData.length - 1],
      // 							                            comment_count: commentData.length,
      // 	        											like_count: like.length,
      // 							                            user_name: getname('name', doc1, admindoc),
      // 									                    user_image: getname('image', doc1, admindoc),
      // 									                    user_medium: getname('medium', doc1, admindoc),
      // 									                    fav: errors.indexOf(favour) == -1 ? '1' : '0'

      // 							                          };
      // 						                          		//data.push(dict);
      // 						                          		//var index = data.findIndex(x => x._id === dict._id);
      // 						                          		var index = data.some(person => person._id === dict._id);
      // 						                          		//console.log('data = ', data)
      // 						                          		//console.log('index comment length greater than 0 = ', index)

      // 						                          		if(followuser != null  && index == false){
      // 															data.push(dict);
      // 														}

      // 														index = data.some(person => person._id === dict._id);

      // 														if(followcat != null  && index == false){
      // 															data.push(dict);
      // 														}

      // 														index = data.some(person => person._id === dict._id);

      // 							                          	if(followsubcat != null  && index == false){
      // 															data.push(dict);
      // 														}

      // 							                          counter += 1;
      // 							                          getUserDetails();
      // 							                        }

      // 							                      });
      // 							                    }

      // 							                    if(comments.length == 0){
      // 							                    	var web_link = doc[counter].web_link;
      // 						                        	if(errors.indexOf(doc[counter].web_link) == -1){
      // 											            if(youtube_parser(doc[counter].web_link) != false){
      // 											              web_link = getId(doc[counter].web_link);

      // 											            }
      // 											         }
      // 											         var r = ('' + doc[counter].web_link).match(/^(https?:)?\/\/[^/]+/i);
      // 							                    	dict = {
      // 							                            _id: doc[counter]._id,
      // 							                            title: doc[counter].title,
      // 														type: doc[counter].type,
      // 														description: doc[counter].description,
      // 														category: cat == null ? '' : cat.name,
      // 														platform: plat == null  ? '' :  plat.name,
      // 														sub_category: sub_cat == null ? '' : sub_cat.name,
      // 														category_id: doc[counter].category,
      // 														sub_category_id: doc[counter].sub_category,
      // 														web_link: web_link,
      // 														link : r ? r[0] : '',
      // 														user_id: doc[counter].user_id,
      // 														formatted_date: doc[counter].formatted_date,
      // 														add_user_type: doc[counter].add_user_type,
      // 														web_link_content: doc[counter].web_link_content,
      // 							                            created_at: doc[counter].created_at,
      // 							                            image: errors.indexOf(doc[counter].image) >= 0 ? '' : doc[counter].image ,
      // 							                            likes: like,
      // 							                            dislikes: dislike,
      // 							                            comments: commentData.length == 0 ? null : commentData[commentData.length - 1],
      // 							                            comment_count: commentData.length,
      // 	        											like_count: like.length,
      // 							                      //       user_name: errors.indexOf(doc1) == -1 ? doc1.name :'',
      // 									                    // user_image: errors.indexOf(doc1) == -1 ? doc1.image : '',
      // 									                    // user_medium: errors.indexOf(doc1) == -1 ? doc1.medium : '',
      // 									                    user_name: getname('name', doc1, admindoc),
      // 									                    user_image: getname('image', doc1, admindoc),
      // 									                    user_medium: getname('medium', doc1, admindoc),
      // 									                    fav: errors.indexOf(favour) == -1 ? '1' : '0'

      // 							                        };
      // 							                        // data.push(dict);
      // 						                         	var index = data.some(person => person._id === dict._id);
      // 						                         	//console.log('data comment length equasl to 0 = ', data)
      // 						                         	//console.log('index comment length equasl to 0 = ', index)
      // 					                          		if(followuser != null  && index == false){
      // 														data.push(dict);
      // 													}
      // 													index = data.some(person => person._id === dict._id);
      // 													if(followcat != null  && index == false){
      // 														data.push(dict);
      // 													}
      // 													index = data.some(person => person._id === dict._id);
      // 						                          	if(followsubcat != null  && index == false){
      // 														data.push(dict);
      // 													}

      // 						                          	counter += 1;
      // 						                          	getUserDetails();
      // 						                      	}else{
      // 						                      		getCommentUserDetails();
      // 						                      	}
      // 							                    // getCommentUserDetails();
      // 							                });
      // 										});
      // 									});
      // 								});
      // 							});

      // 						});
      //                     });
      //                 });
      //               	 	});
      // 			});
      //             	});
      //           });
      //         // }else{
      //         //   counter += 1;
      //         //   // getUserDetails();
      //         // }

      //         // getUserDetails();
      //       }else{

      //       	var result = arraySort(data, ['like_count', 'comment_count']);
      //         	res.send({
      //            error: null,
      //            status: 1,
      //            data: result
      //         	});
      //      	}
      //    	};
      //    	getUserDetails();

      //  });
    } else if (req.body.type == "Today") {
      var formatted_date = formatDate();
      // if(req.body.cat == "All"){
      // 	query = {formatted_date: formatted_date};
      // }else{
      // 	query = { category:req.body.cat , formatted_date: formatted_date};
      // }
      var pageNo = parseInt(req.body.skip);
      var size = parseInt(req.body.limit);
      var skip = size * (pageNo - 1);
      // query['like_count'] = { };

      reccomandation
        .find(query)
        .limit(size)
        .skip(skip)
        .sort({ like_count: -1, comment_count: -1, created_at: -1 })
        .exec(function (err, doc) {
          var counter = 0,
            dict = {},
            data = [];

          function getUserDetails() {
            if (counter < doc.length) {
              // if(typeof(doc[counter].userId) != 'undefined'){
              users.findOne(
                { _id: doc[counter].user_id },
                function (err, doc1) {
                  likes.find(
                    { postId: doc[counter]._id },
                    function (err, like) {
                      dislikes.find(
                        { postId: doc[counter]._id },
                        function (err, dislike) {
                          comments.find(
                            { postId: doc[counter]._id },
                            function (err, comments) {
                              favourites.findOne(
                                {
                                  recc_id: doc[counter]._id,
                                  user_id: req.body.user_id,
                                },
                                null,
                                function (err, favour) {
                                  categories.findOne(
                                    { _id: doc[counter].category },
                                    null,
                                    function (err, cat) {
                                      plaform.findOne(
                                        { _id: doc[counter].platform },
                                        null,
                                        function (err, plat) {
                                          subcategories.findOne(
                                            { _id: doc[counter].sub_category },
                                            null,
                                            function (err, sub_cat) {
                                              admin.findOne(
                                                {},
                                                function (err, admindoc) {
                                                  var count = 0,
                                                    dic = {},
                                                    commentData = [];
                                                  function getname(
                                                    str,
                                                    user,
                                                    admin
                                                  ) {
                                                    if (str == "name") {
                                                      if (
                                                        doc[counter]
                                                          .add_user_type ==
                                                        "user"
                                                      ) {
                                                        if (
                                                          errors.indexOf(
                                                            user
                                                          ) == -1
                                                        ) {
                                                          return user.name;
                                                        } else {
                                                          return "";
                                                        }
                                                      } else {
                                                        if (
                                                          errors.indexOf(
                                                            admindoc
                                                          ) == -1
                                                        ) {
                                                          return admindoc.firstname;
                                                        } else {
                                                          return "";
                                                        }
                                                      }
                                                    } else if (str == "image") {
                                                      if (
                                                        doc[counter]
                                                          .add_user_type ==
                                                        "user"
                                                      ) {
                                                        if (
                                                          errors.indexOf(
                                                            user
                                                          ) == -1
                                                        ) {
                                                          return user.image;
                                                        } else {
                                                          return "";
                                                        }
                                                      } else {
                                                        if (
                                                          errors.indexOf(
                                                            admindoc
                                                          ) == -1
                                                        ) {
                                                          return admindoc.image;
                                                        } else {
                                                          return "";
                                                        }
                                                      }
                                                    } else {
                                                      if (
                                                        errors.indexOf(user) ==
                                                        -1
                                                      ) {
                                                        return user.medium;
                                                      } else {
                                                        return "";
                                                      }
                                                    }
                                                  }
                                                  function getCommentUserDetails() {
                                                    // users.findOne({'_id': doc[counter].user_id}, function(err, user){

                                                    users.findOne(
                                                      {
                                                        _id: comments[count]
                                                          .userId,
                                                      },
                                                      function (err, user) {
                                                        // if(count < comments.length){
                                                        dic = {
                                                          comment:
                                                            comments[count]
                                                              .comment,
                                                          postId:
                                                            comments[count]
                                                              .postId,
                                                          userId:
                                                            comments[count]
                                                              .userId,
                                                          _id: comments[count]
                                                            ._id,
                                                          user: user.name,
                                                          image: user.image,
                                                          medium: user.medium,
                                                        };

                                                        commentData.push(dic);
                                                        if (
                                                          count <
                                                          comments.length - 1
                                                        ) {
                                                          count = count + 1;
                                                          getCommentUserDetails();
                                                        } else {
                                                          var web_link =
                                                            doc[counter]
                                                              .web_link;
                                                          if (
                                                            errors.indexOf(
                                                              doc[counter]
                                                                .web_link
                                                            ) == -1
                                                          ) {
                                                            if (
                                                              youtube_parser(
                                                                doc[counter]
                                                                  .web_link
                                                              ) != false
                                                            ) {
                                                              web_link = getId(
                                                                doc[counter]
                                                                  .web_link
                                                              );
                                                            }
                                                          }
                                                          var r = (
                                                            "" +
                                                            doc[counter]
                                                              .web_link
                                                          ).match(
                                                            /^(https?:)?\/\/[^/]+/i
                                                          );
                                                          dict = {
                                                            _id: doc[counter]
                                                              ._id,
                                                            title:
                                                              doc[counter]
                                                                .title,
                                                            type: doc[counter]
                                                              .type,
                                                            description:
                                                              doc[counter]
                                                                .description,
                                                            location:
                                                              doc[counter]
                                                                .location,
                                                            category:
                                                              cat == null
                                                                ? ""
                                                                : cat.name,
                                                            platform:
                                                              plat == null
                                                                ? ""
                                                                : plat.name,
                                                            sub_category:
                                                              sub_cat == null
                                                                ? ""
                                                                : sub_cat.name,
                                                            category_id:
                                                              doc[counter]
                                                                .category,
                                                            sub_category_id:
                                                              doc[counter]
                                                                .sub_category,
                                                            web_link: web_link,

                                                            link: r ? r[0] : "",
                                                            user_id:
                                                              doc[counter]
                                                                .user_id,
                                                            formatted_date:
                                                              doc[counter]
                                                                .formatted_date,
                                                            created_at:
                                                              doc[counter]
                                                                .created_at,
                                                            image:
                                                              doc[counter]
                                                                .image,
                                                            add_user_type:
                                                              doc[counter]
                                                                .add_user_type,

                                                            recc_type:
                                                              doc[counter]
                                                                .recc_type,
                                                            web_link_content:
                                                              doc[counter]
                                                                .web_link_content,
                                                            likes: like,
                                                            dislikes: dislike,
                                                            comments:
                                                              commentData.length ==
                                                              0
                                                                ? null
                                                                : commentData[
                                                                    commentData.length -
                                                                      1
                                                                  ],
                                                            comment_count:
                                                              commentData.length,
                                                            like_count:
                                                              like.length,
                                                            user_name: getname(
                                                              "name",
                                                              doc1,
                                                              admindoc
                                                            ),
                                                            user_image: getname(
                                                              "image",
                                                              doc1,
                                                              admindoc
                                                            ),
                                                            user_medium:
                                                              getname(
                                                                "medium",
                                                                doc1,
                                                                admindoc
                                                              ),
                                                            fav:
                                                              errors.indexOf(
                                                                favour
                                                              ) == -1
                                                                ? "1"
                                                                : "0",
                                                            recc_contact:
                                                              doc[counter]
                                                                .recc_contact,
                                                            tags: doc[counter]
                                                              .tags,
                                                          };
                                                          data.push(dict);
                                                          counter += 1;
                                                          getUserDetails();
                                                        }
                                                      }
                                                    );
                                                  }

                                                  if (comments.length == 0) {
                                                    var web_link =
                                                      doc[counter].web_link;
                                                    if (
                                                      errors.indexOf(
                                                        doc[counter].web_link
                                                      ) == -1
                                                    ) {
                                                      if (
                                                        youtube_parser(
                                                          doc[counter].web_link
                                                        ) != false
                                                      ) {
                                                        web_link = getId(
                                                          doc[counter].web_link
                                                        );
                                                      }
                                                    }
                                                    var r = (
                                                      "" + doc[counter].web_link
                                                    ).match(
                                                      /^(https?:)?\/\/[^/]+/i
                                                    );
                                                    dict = {
                                                      _id: doc[counter]._id,
                                                      title: doc[counter].title,
                                                      type: doc[counter].type,
                                                      description:
                                                        doc[counter]
                                                          .description,
                                                      category:
                                                        cat == null
                                                          ? ""
                                                          : cat.name,
                                                      sub_category:
                                                        sub_cat == null
                                                          ? ""
                                                          : sub_cat.name,
                                                      category_id:
                                                        doc[counter].category,
                                                      platform:
                                                        plat == null
                                                          ? ""
                                                          : plat.name,
                                                      sub_category_id:
                                                        doc[counter]
                                                          .sub_category,
                                                      web_link: web_link,
                                                      link: r ? r[0] : "",
                                                      user_id:
                                                        doc[counter].user_id,
                                                      formatted_date:
                                                        doc[counter]
                                                          .formatted_date,
                                                      location:
                                                        doc[counter].location,
                                                      add_user_type:
                                                        doc[counter]
                                                          .add_user_type,
                                                      recc_type:
                                                        doc[counter].recc_type,
                                                      web_link_content:
                                                        doc[counter]
                                                          .web_link_content,
                                                      created_at:
                                                        doc[counter].created_at,
                                                      image:
                                                        errors.indexOf(
                                                          doc[counter].image
                                                        ) >= 0
                                                          ? ""
                                                          : doc[counter].image,
                                                      likes: like,
                                                      dislikes: dislike,
                                                      comments:
                                                        commentData.length == 0
                                                          ? null
                                                          : commentData[
                                                              commentData.length -
                                                                1
                                                            ],
                                                      comment_count:
                                                        commentData.length,
                                                      like_count: like.length,
                                                      //       user_name: errors.indexOf(doc1) == -1 ? doc1.name :'',
                                                      // user_image: errors.indexOf(doc1) == -1 ? doc1.image : '',
                                                      // user_medium: errors.indexOf(doc1) == -1 ? doc1.medium : '',
                                                      user_name: getname(
                                                        "name",
                                                        doc1,
                                                        admindoc
                                                      ),
                                                      user_image: getname(
                                                        "image",
                                                        doc1,
                                                        admindoc
                                                      ),
                                                      user_medium: getname(
                                                        "medium",
                                                        doc1,
                                                        admindoc
                                                      ),
                                                      fav:
                                                        errors.indexOf(
                                                          favour
                                                        ) == -1
                                                          ? "1"
                                                          : "0",
                                                      recc_contact:
                                                        doc[counter]
                                                          .recc_contact,
                                                      tags: doc[counter].tags,
                                                    };
                                                    data.push(dict);
                                                    counter += 1;
                                                    getUserDetails();
                                                  } else {
                                                    getCommentUserDetails();
                                                  }
                                                }
                                              );
                                            }
                                          );
                                        }
                                      );
                                    }
                                  );
                                }
                              );
                            }
                          );
                        }
                      );
                    }
                  );
                }
              );
              // }else{
              //   counter += 1;
              //   // getUserDetails();
              // }

              // getUserDetails();
            } else {
              var result = arraySort(data, ["like_count", "comment_count"], {
                reverse: true,
              });
              res.send({
                error: null,
                status: 1,
                data: data,
              });
            }
          }
          getUserDetails();
        });
    } else {
      if (req.body.cat == "All") {
        query = {};
      } else {
        query = { category: req.body.cat };
      }
      query = { category: { $in: req.body.filter_cat_array_global } };
      var pageNo = parseInt(req.body.skip);
      var size = parseInt(req.body.limit);
      var skip = size * (pageNo - 1);
      reccomandation
        .find(query) /*.limit(size).skip(skip)*/
        .sort({ like_count: -1, comment_count: -1, created_at: -1 })
        .exec(function (err, doc) {
          var counter = 0,
            dict = {},
            data = [];

          function getUserDetails() {
            if (counter < doc.length) {
              // if(typeof(doc[counter].userId) != 'undefined'){
              users.findOne(
                { _id: doc[counter].user_id },
                function (err, doc1) {
                  likes.find(
                    { postId: doc[counter]._id },
                    function (err, like) {
                      dislikes.find(
                        { postId: doc[counter]._id },
                        function (err, dislike) {
                          comments.find(
                            { postId: doc[counter]._id },
                            function (err, comments) {
                              favourites.findOne(
                                {
                                  recc_id: doc[counter]._id,
                                  user_id: req.body.user_id,
                                },
                                null,
                                function (err, favour) {
                                  categories.findOne(
                                    { _id: doc[counter].category },
                                    null,
                                    function (err, cat) {
                                      plaform.findOne(
                                        { _id: doc[counter].platform },
                                        null,
                                        function (err, plat) {
                                          subcategories.findOne(
                                            { _id: doc[counter].sub_category },
                                            null,
                                            function (err, sub_cat) {
                                              admin.findOne(
                                                {},
                                                function (err, admindoc) {
                                                  var count = 0,
                                                    dic = {},
                                                    commentData = [];
                                                  function getname(
                                                    str,
                                                    user,
                                                    admin
                                                  ) {
                                                    //console.log('user saved', user)
                                                    if (str == "name") {
                                                      if (
                                                        doc[counter]
                                                          .add_user_type ==
                                                        "user"
                                                      ) {
                                                        if (
                                                          errors.indexOf(
                                                            user
                                                          ) == -1
                                                        ) {
                                                          return user.name;
                                                        } else {
                                                          return "";
                                                        }
                                                      } else {
                                                        if (
                                                          errors.indexOf(
                                                            admindoc
                                                          ) == -1
                                                        ) {
                                                          return admindoc.firstname;
                                                        } else {
                                                          return "";
                                                        }
                                                      }
                                                    } else if (str == "image") {
                                                      if (
                                                        doc[counter]
                                                          .add_user_type ==
                                                        "user"
                                                      ) {
                                                        if (
                                                          errors.indexOf(
                                                            user
                                                          ) == -1
                                                        ) {
                                                          return user.image;
                                                        } else {
                                                          return "";
                                                        }
                                                      } else {
                                                        if (
                                                          errors.indexOf(
                                                            admindoc
                                                          ) == -1
                                                        ) {
                                                          return admindoc.image;
                                                        } else {
                                                          return "";
                                                        }
                                                      }
                                                    } else {
                                                      if (
                                                        errors.indexOf(user) ==
                                                        -1
                                                      ) {
                                                        return user.medium;
                                                      } else {
                                                        return "";
                                                      }
                                                    }
                                                  }
                                                  function getCommentUserDetails() {
                                                    users.findOne(
                                                      {
                                                        _id: comments[count]
                                                          .userId,
                                                      },
                                                      function (err, user) {
                                                        dic = {
                                                          comment:
                                                            comments[count]
                                                              .comment,
                                                          postId:
                                                            comments[count]
                                                              .postId,
                                                          userId:
                                                            comments[count]
                                                              .userId,
                                                          _id: comments[count]
                                                            ._id,
                                                          user: user.name,
                                                          image: user.image,
                                                          medium: user.medium,
                                                        };
                                                        commentData.push(dic);

                                                        if (
                                                          count <
                                                          comments.length - 1
                                                        ) {
                                                          count = count + 1;
                                                          getCommentUserDetails();
                                                        } else {
                                                          var web_link =
                                                            doc[counter]
                                                              .web_link;
                                                          if (
                                                            errors.indexOf(
                                                              doc[counter]
                                                                .web_link
                                                            ) == -1
                                                          ) {
                                                            if (
                                                              youtube_parser(
                                                                doc[counter]
                                                                  .web_link
                                                              ) != false
                                                            ) {
                                                              web_link = getId(
                                                                doc[counter]
                                                                  .web_link
                                                              );
                                                            }
                                                          }
                                                          var r = (
                                                            "" +
                                                            doc[counter]
                                                              .web_link
                                                          ).match(
                                                            /^(https?:)?\/\/[^/]+/i
                                                          );
                                                          dict = {
                                                            _id: doc[counter]
                                                              ._id,
                                                            title:
                                                              doc[counter]
                                                                .title,
                                                            type: doc[counter]
                                                              .type,
                                                            description:
                                                              doc[counter]
                                                                .description,
                                                            category:
                                                              cat == null
                                                                ? ""
                                                                : cat.name,
                                                            platform:
                                                              plat == null
                                                                ? ""
                                                                : plat.name,
                                                            sub_category:
                                                              sub_cat == null
                                                                ? ""
                                                                : sub_cat.name,
                                                            web_link: web_link,
                                                            link: r ? r[0] : "",
                                                            user_id:
                                                              doc[counter]
                                                                .user_id,
                                                            tags: doc[counter]
                                                              .tags,
                                                            formatted_date:
                                                              doc[counter]
                                                                .formatted_date,
                                                            created_at:
                                                              doc[counter]
                                                                .created_at,
                                                            location:
                                                              doc[counter]
                                                                .location,
                                                            image:
                                                              doc[counter]
                                                                .image,
                                                            add_user_type:
                                                              doc[counter]
                                                                .add_user_type,
                                                            web_link_content:
                                                              doc[counter]
                                                                .web_link_content,
                                                            likes: like,
                                                            dislikes: dislike,
                                                            comments:
                                                              commentData.length ==
                                                              0
                                                                ? null
                                                                : commentData[
                                                                    commentData.length -
                                                                      1
                                                                  ],
                                                            comment_count:
                                                              commentData.length,
                                                            like_count:
                                                              like.length,
                                                            user_name: getname(
                                                              "name",
                                                              doc1,
                                                              admindoc
                                                            ),
                                                            user_image: getname(
                                                              "image",
                                                              doc1,
                                                              admindoc
                                                            ),
                                                            user_medium:
                                                              getname(
                                                                "medium",
                                                                doc1,
                                                                admindoc
                                                              ),
                                                            fav:
                                                              errors.indexOf(
                                                                favour
                                                              ) == -1
                                                                ? "1"
                                                                : "0",
                                                          };
                                                          // if(errors.indexOf(favour) == -1){
                                                          // 	data.push(dict);
                                                          // }
                                                          data.push(dict);
                                                          counter += 1;
                                                          getUserDetails();
                                                        }
                                                      }
                                                    );
                                                  }

                                                  if (comments.length == 0) {
                                                    var web_link =
                                                      doc[counter].web_link;
                                                    if (
                                                      errors.indexOf(
                                                        doc[counter].web_link
                                                      ) == -1
                                                    ) {
                                                      if (
                                                        youtube_parser(
                                                          doc[counter].web_link
                                                        ) != false
                                                      ) {
                                                        web_link = getId(
                                                          doc[counter].web_link
                                                        );
                                                      }
                                                    }
                                                    var r = (
                                                      "" + doc[counter].web_link
                                                    ).match(
                                                      /^(https?:)?\/\/[^/]+/i
                                                    );
                                                    dict = {
                                                      _id: doc[counter]._id,
                                                      title: doc[counter].title,
                                                      type: doc[counter].type,
                                                      description:
                                                        doc[counter]
                                                          .description,
                                                      category:
                                                        cat == null
                                                          ? ""
                                                          : cat.name,
                                                      platform:
                                                        plat == null
                                                          ? ""
                                                          : plat.name,
                                                      sub_category:
                                                        sub_cat == null
                                                          ? ""
                                                          : sub_cat.name,
                                                      category_id:
                                                        doc[counter].category,
                                                      sub_category_id:
                                                        doc[counter]
                                                          .sub_category,
                                                      web_link: web_link,
                                                      link: r ? r[0] : "",
                                                      location:
                                                        doc[counter].location,
                                                      user_id:
                                                        doc[counter].user_id,
                                                      formatted_date:
                                                        doc[counter]
                                                          .formatted_date,
                                                      add_user_type:
                                                        doc[counter]
                                                          .add_user_type,
                                                      web_link_content:
                                                        doc[counter]
                                                          .web_link_content,
                                                      created_at:
                                                        doc[counter].created_at,
                                                      image:
                                                        errors.indexOf(
                                                          doc[counter].image
                                                        ) >= 0
                                                          ? ""
                                                          : doc[counter].image,
                                                      likes: like,
                                                      tags: doc[counter].tags,
                                                      dislikes: dislike,
                                                      comments:
                                                        commentData.length == 0
                                                          ? null
                                                          : commentData[
                                                              commentData.length -
                                                                1
                                                            ],
                                                      comment_count:
                                                        commentData.length,
                                                      like_count: like.length,
                                                      //       user_name: errors.indexOf(doc1) == -1 ? doc1.name :'',
                                                      // user_image: errors.indexOf(doc1) == -1 ? doc1.image : '',
                                                      // user_medium: errors.indexOf(doc1) == -1 ? doc1.medium : '',
                                                      user_name: getname(
                                                        "name",
                                                        doc1,
                                                        admindoc
                                                      ),
                                                      user_image: getname(
                                                        "image",
                                                        doc1,
                                                        admindoc
                                                      ),
                                                      user_medium: getname(
                                                        "medium",
                                                        doc1,
                                                        admindoc
                                                      ),
                                                      fav:
                                                        errors.indexOf(
                                                          favour
                                                        ) == -1
                                                          ? "1"
                                                          : "0",
                                                      recc_contact:
                                                        doc[counter]
                                                          .recc_contact,
                                                      tags: doc[counter].tags,
                                                    };
                                                    // if(favour != null){
                                                    //   	data.push(dict);
                                                    //   }
                                                    data.push(dict);
                                                    counter += 1;
                                                    getUserDetails();
                                                  } else {
                                                    getCommentUserDetails();
                                                  }
                                                }
                                              );
                                            }
                                          );
                                        }
                                      );
                                    }
                                  );
                                }
                              );
                            }
                          );
                        }
                      );
                    }
                  );
                }
              );
            } else {
              res.send({
                error: null,
                status: 1,
                data: data,
              });
            }
          }
          getUserDetails();
        });
    }
  } catch (err) {
    console.log(err);
    res.send({
      error: err,
      status: 0,
      data: [],
    });
  }
};

exports.get_all_local_recc = function (req, res) {
  var pageNo = parseInt(req.body.skip);
  var size = parseInt(req.body.limit);
  var skip = size * (pageNo - 1);
  var all_recc = [],
    dict = {},
    data = [];
  var counter = 0,
    latest_counter = 0;
  var query = {};
  // if(req.body.cat == "All"){
  // 	if(req.body.filter_cat_array.length > 0){
  // 		query = {category: {$in : req.body.filter_cat_array}};
  // 	}

  // }else{
  // 	query = { category:req.body.cat };
  // }
  var follow_cat_subcat_array = [],
    follow_cat_subcat_ids_array = [],
    cat_counter = 0,
    subcat_counter = 0,
    user_counter = 0;
  try {
    reccomandation
      .find({ lat: req.body.lat, long: req.body.lng })
      .sort({ like_count: -1, comment_count: -1, created_at: -1 })
      .exec(function (err, doc) {
        // all_recc = [...all_recc, ...doc];
        getdata(doc);
      });

    function getdata(doc) {
      if (counter < doc.length) {
        users.findOne({ _id: doc[counter].user_id }, function (err, doc1) {
          likes.find({ postId: doc[counter]._id }, function (err, like) {
            dislikes.find(
              { postId: doc[counter]._id },
              function (err, dislike) {
                comments.find(
                  { postId: doc[counter]._id },
                  function (err, comments) {
                    favourites.findOne(
                      { recc_id: doc[counter]._id, user_id: req.body.user_id },
                      null,
                      function (err, favour) {
                        categories.findOne(
                          { _id: doc[counter].category },
                          null,
                          function (err, cat) {
                            plaform.findOne(
                              { _id: doc[counter].platform },
                              null,
                              function (err, plat) {
                                subcategories.findOne(
                                  { _id: doc[counter].sub_category },
                                  null,
                                  function (err, sub_cat) {
                                    categoryfollow.findOne(
                                      {
                                        cat_id: doc[counter].category,
                                        user_id: req.body.user_id,
                                      },
                                      null,
                                      function (err, followcat) {
                                        // console.log('followcat = ', followcat);

                                        subcategoryfollow.findOne(
                                          {
                                            sub_cat_id:
                                              doc[counter].sub_category,
                                            user_id: req.body.user_id,
                                          },
                                          null,
                                          function (err, followsubcat) {
                                            friends.findOne(
                                              {
                                                friendId: doc[counter].user_id,
                                                userId: req.body.user_id,
                                              },
                                              null,
                                              function (err, followuser) {
                                                // admin.findOne({}, function(err, admindoc){
                                                var count = 0,
                                                  dic = {},
                                                  commentData = [];

                                                function getCommentUserDetails() {
                                                  users.findOne(
                                                    {
                                                      _id: comments[count]
                                                        .userId,
                                                    },
                                                    function (err, user) {
                                                      dic = {
                                                        comment:
                                                          comments[count]
                                                            .comment,
                                                        postId:
                                                          comments[count]
                                                            .postId,
                                                        userId:
                                                          comments[count]
                                                            .userId,
                                                        _id: comments[count]
                                                          ._id,
                                                        user: user.name,
                                                        image: user.image,
                                                        medium: user.medium,
                                                      };

                                                      commentData.push(dic);
                                                      if (
                                                        count <
                                                        comments.length - 1
                                                      ) {
                                                        count = count + 1;
                                                        getCommentUserDetails();
                                                      } else {
                                                        dict = {
                                                          _id: doc[counter]._id,
                                                          title:
                                                            doc[counter].title,
                                                          type: doc[counter]
                                                            .type,
                                                          description:
                                                            doc[counter]
                                                              .description,
                                                          category:
                                                            cat == null
                                                              ? ""
                                                              : cat.name,
                                                          user_id:
                                                            doc[counter]
                                                              .user_id,
                                                          lat: doc[counter].lat,
                                                          long: doc[counter]
                                                            .long,
                                                          location:
                                                            doc[counter]
                                                              .location,
                                                          formatted_date:
                                                            doc[counter]
                                                              .formatted_date,
                                                          created_at:
                                                            doc[counter]
                                                              .created_at,
                                                          image:
                                                            doc[counter].image,
                                                          add_user_type:
                                                            doc[counter]
                                                              .add_user_type,
                                                          recc_type:
                                                            doc[counter]
                                                              .recc_type,
                                                          likes: like,
                                                          dislikes: dislike,
                                                          comments:
                                                            commentData.length ==
                                                            0
                                                              ? null
                                                              : commentData[
                                                                  commentData.length -
                                                                    1
                                                                ],
                                                          comment_count:
                                                            commentData.length,
                                                          like_count:
                                                            like.length,
                                                          user_name:
                                                            errors.indexOf(
                                                              doc1
                                                            ) != -1
                                                              ? ""
                                                              : doc1.name,
                                                          user_image:
                                                            errors.indexOf(
                                                              doc1
                                                            ) != -1
                                                              ? ""
                                                              : doc1.image,
                                                          user_medium:
                                                            errors.indexOf(
                                                              doc1
                                                            ) != -1
                                                              ? ""
                                                              : doc1.medium,
                                                          fav:
                                                            errors.indexOf(
                                                              favour
                                                            ) == -1
                                                              ? "1"
                                                              : "0",
                                                          recc_contact:
                                                            doc[counter]
                                                              .recc_contact,
                                                          tags: doc[counter]
                                                            .tags,
                                                        };
                                                        data.push(dict);

                                                        var index = data.some(
                                                          (person) =>
                                                            person._id ===
                                                            dict._id
                                                        );

                                                        index = data.some(
                                                          (person) =>
                                                            person._id ===
                                                            dict._id
                                                        );

                                                        index = data.some(
                                                          (person) =>
                                                            person._id ===
                                                            dict._id
                                                        );

                                                        counter += 1;
                                                        getdata(doc);
                                                      }
                                                    }
                                                  );
                                                }

                                                if (comments.length == 0) {
                                                  dict = {
                                                    _id: doc[counter]._id,
                                                    title: doc[counter].title,
                                                    type: doc[counter].type,
                                                    description:
                                                      doc[counter].description,
                                                    category:
                                                      cat == null
                                                        ? ""
                                                        : cat.name,
                                                    category_id:
                                                      doc[counter].category,
                                                    lat: doc[counter].lat,
                                                    long: doc[counter].long,
                                                    location:
                                                      doc[counter].location,
                                                    user_id:
                                                      doc[counter].user_id,
                                                    formatted_date:
                                                      doc[counter]
                                                        .formatted_date,
                                                    add_user_type:
                                                      doc[counter]
                                                        .add_user_type,
                                                    recc_type:
                                                      doc[counter].recc_type,
                                                    created_at:
                                                      doc[counter].created_at,
                                                    image:
                                                      errors.indexOf(
                                                        doc[counter].image
                                                      ) >= 0
                                                        ? ""
                                                        : doc[counter].image,
                                                    likes: like,
                                                    dislikes: dislike,
                                                    comments:
                                                      commentData.length == 0
                                                        ? null
                                                        : commentData[
                                                            commentData.length -
                                                              1
                                                          ],
                                                    comment_count:
                                                      commentData.length,
                                                    like_count: like.length,

                                                    user_name:
                                                      errors.indexOf(doc1) != -1
                                                        ? ""
                                                        : doc1.name,
                                                    user_image:
                                                      errors.indexOf(doc1) != -1
                                                        ? ""
                                                        : doc1.image,
                                                    user_medium:
                                                      errors.indexOf(doc1) != -1
                                                        ? ""
                                                        : doc1.medium,
                                                    fav:
                                                      errors.indexOf(favour) ==
                                                      -1
                                                        ? "1"
                                                        : "0",
                                                    recc_contact:
                                                      doc[counter].recc_contact,
                                                    tags: doc[counter].tags,
                                                  };
                                                  data.push(dict);
                                                  var index = data.some(
                                                    (person) =>
                                                      person._id === dict._id
                                                  );

                                                  index = data.some(
                                                    (person) =>
                                                      person._id === dict._id
                                                  );

                                                  index = data.some(
                                                    (person) =>
                                                      person._id === dict._id
                                                  );

                                                  counter += 1;
                                                  getdata(doc);
                                                } else {
                                                  getCommentUserDetails();
                                                }
                                                // getCommentUserDetails();
                                                // });
                                              }
                                            );
                                          }
                                        );
                                      }
                                    );
                                  }
                                );
                              }
                            );
                          }
                        );
                      }
                    );
                  }
                );
              }
            );
          });
        });
      } else {
        var result = arraySort(data, ["like_count", "comment_count"], {
          reverse: true,
        });
        res.send({
          error: null,
          status: 1,
          data: result,
        });
      }
    }
  } catch (err) {
    console.log(err);
    res.send({
      error: err,
      status: 0,
      data: [],
    });
  }
};

function distance(lat1, lon1, lat2, lon2, unit) {
  if (lat1 == lat2 && lon1 == lon2) {
    return 0;
  } else {
    var radlat1 = (Math.PI * lat1) / 180;
    var radlat2 = (Math.PI * lat2) / 180;
    var theta = lon1 - lon2;
    var radtheta = (Math.PI * theta) / 180;
    var dist =
      Math.sin(radlat1) * Math.sin(radlat2) +
      Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta);
    if (dist > 1) {
      dist = 1;
    }
    dist = Math.acos(dist);
    dist = (dist * 180) / Math.PI;
    dist = dist * 60 * 1.1515;
    if (unit == "K") {
      dist = dist * 1.609344;
    }
    if (unit == "N") {
      dist = dist * 0.8684;
    }
    return dist;
  }
}

exports.filter_local_recc = function (req, res) {
  var pageNo = parseInt(req.body.skip);
  var size = parseInt(req.body.limit);
  var skip = size * (pageNo - 1);
  var all_recc = [],
    dict = {},
    data = [];
  var counter = 0,
    latest_counter = 0,
    conditions = {};

  // var regex = "^" + req.body.keyword + ".*";
  var regex = ".*" + req.body.keyword + ".*",
    query_match,
    query_match_aggregate = {},
    query_match_aggregatenew = {};
  if (req.body.cat == "All") {
    if (req.body.keyword !== "" && req.body.lng == 0 && req.body.lat == 0) {
      query_match_aggregate = {
        $or: [
          { title: { $regex: req.body.keyword, $options: "$i" } },
          { description: { $regex: req.body.keyword, $options: "$i" } },
          { tags: { $elemMatch: { name: req.body.keyword } } },
        ],
      };

      // query_match_aggregate = [
      //   {
      //     $match: {
      //       $or: [
      //         { title: { $regex: req.body.keyword, $options: "$i" } },
      //         { description: { $regex: req.body.keyword, $options: "$i" } },
      //         { tags: { $elemMatch: { name: req.body.keyword } } },
      //       ],
      //     },
      //   },
      // ];
    } else if (
      req.body.keyword == "" &&
      req.body.lng !== 0 &&
      req.body.lat !== 0
    ) {
      // query_match = { "recc_type": req.body.recc_type, "category": {$in : req.body.category}, $or : [{title: { $regex: req.body.keyword, $options:"$i" }}, {description: { $regex: req.body.keyword, $options:"$i" }}]};

      query_match_aggregate = {
        cords: {
          $near: {
            $minDistance: 0,
            $maxDistance: 5000,
            $geometry: {
              type: "Point",
              coordinates: [req.body.lng, req.body.lat],
            },
          },
        },
      };

      // conditions[] =  {$or : [{title: { $regex: req.body.keyword, $options:"$i" }}, {description: { $regex: req.body.keyword, $options:"$i" }}]};
    } else {
      //when add both title and location
      // query_match_aggregate = {
      // lat: req.body.lat,
      // long: req.body.lng,
      // $or: [
      //   { title: { $regex: req.body.keyword, $options: "$i" } },
      //   { description: { $regex: req.body.keyword, $options: "$i" } },
      //   { tags: { $elemMatch: { name: req.body.keyword } } },
      // ],
      // $geoNear: {
      //   near: { type: "Point", coordinates: [req.body.lng, req.body.lat] },
      //   maxDistance: 5000,
      //   spherical: true,
      //   distanceField: "distance",
      // },

      query_match_aggregate = {
        cords: {
          $near: {
            $minDistance: 0,
            $maxDistance: 5000,
            $geometry: {
              type: "Point",
              coordinates: [req.body.lng, req.body.lat],
            },
          },
        },
        $or: [
          { title: { $regex: req.body.keyword, $options: "$i" } },
          { description: { $regex: req.body.keyword, $options: "$i" } },
          { tags: { $elemMatch: { name: req.body.keyword } } },
        ],
      };
    }
  } else {
    //category selected
    if (req.body.keyword !== "" && req.body.lng == 0 && req.body.lat == 0) {
      query_match_aggregate = {
        $or: [
          { title: { $regex: req.body.keyword, $options: "$i" } },
          { description: { $regex: req.body.keyword, $options: "$i" } },
          { tags: { $elemMatch: { name: req.body.keyword } } },
        ],
        category: req.body.cat,
      };
    } else if (
      req.body.keyword == "" &&
      req.body.lng == 0 &&
      req.body.lat == 0
    ) {
      // query_match = { "recc_type": req.body.recc_type, "category": {$in : req.body.category}, $or : [{title: { $regex: req.body.keyword, $options:"$i" }}, {description: { $regex: req.body.keyword, $options:"$i" }}]};
      query_match_aggregate = {
        category: req.body.cat,
      };
      // conditions[] =  {$or : [{title: { $regex: req.body.keyword, $options:"$i" }}, {description: { $regex: req.body.keyword, $options:"$i" }}]};
    } else if (
      req.body.keyword == "" &&
      req.body.lng !== 0 &&
      req.body.lat !== 0
    ) {
      // query_match = { "recc_type": req.body.recc_type, "category": {$in : req.body.category}, $or : [{title: { $regex: req.body.keyword, $options:"$i" }}, {description: { $regex: req.body.keyword, $options:"$i" }}]};
      query_match_aggregate = {
        cords: {
          $near: {
            $minDistance: 0,
            $maxDistance: 5000,
            $geometry: {
              type: "Point",
              coordinates: [req.body.lng, req.body.lat],
            },
          },
        },
        category: req.body.cat,
      };
      // conditions[] =  {$or : [{title: { $regex: req.body.keyword, $options:"$i" }}, {description: { $regex: req.body.keyword, $options:"$i" }}]};
    } else {
      //when add both title and location
      query_match_aggregate = {
        cords: {
          $near: {
            $minDistance: 0,
            $maxDistance: 5000,
            $geometry: {
              type: "Point",
              coordinates: [req.body.lng, req.body.lat],
            },
          },
        },

        $or: [
          { title: { $regex: req.body.keyword, $options: "$i" } },
          { description: { $regex: req.body.keyword, $options: "$i" } },
          { tags: { $elemMatch: { name: req.body.keyword } } },
        ],
        category: req.body.cat,
      };
    }
  }

  try {
    reccomandation.find(query_match_aggregate).exec(function (err, data) {
      // reccomandation.aggregate(query_match_aggregate, function(err, data) {
      getdata(data);
    });

    // reccomandation.find(query_match_aggregate, function (err, data) {
    //   // reccomandation.aggregate(query_match_aggregate, function(err, data) {
    //   // console.log(data);
    //   getdata(data);
    // });

    function getdata(doc) {
      // console.log("docccccccccccccccccccc", doc);
      // console.log("counterrrrrrrrrrrrr", doc[counter]);
      if (counter < doc.length) {
        users.findOne({ _id: doc[counter].user_id }, function (err, doc1) {
          likes.find({ postId: doc[counter]._id }, function (err, like) {
            dislikes.find(
              { postId: doc[counter]._id },
              function (err, dislike) {
                comments.find(
                  { postId: doc[counter]._id },
                  function (err, comments) {
                    favourites.findOne(
                      { recc_id: doc[counter]._id, user_id: req.body.user_id },
                      null,
                      function (err, favour) {
                        categories.findOne(
                          { _id: doc[counter].category },
                          null,
                          function (err, cat) {
                            plaform.findOne(
                              { _id: doc[counter].platform },
                              null,
                              function (err, plat) {
                                subcategories.findOne(
                                  { _id: doc[counter].sub_category },
                                  null,
                                  function (err, sub_cat) {
                                    categoryfollow.findOne(
                                      {
                                        cat_id: doc[counter].category,
                                        user_id: req.body.user_id,
                                      },
                                      null,
                                      function (err, followcat) {
                                        // console.log('followcat = ', followcat);

                                        subcategoryfollow.findOne(
                                          {
                                            sub_cat_id:
                                              doc[counter].sub_category,
                                            user_id: req.body.user_id,
                                          },
                                          null,
                                          function (err, followsubcat) {
                                            friends.findOne(
                                              {
                                                friendId: doc[counter].user_id,
                                                userId: req.body.user_id,
                                              },
                                              null,
                                              function (err, followuser) {
                                                // admin.findOne({}, function(err, admindoc){
                                                var count = 0,
                                                  dic = {},
                                                  commentData = [];

                                                function getCommentUserDetails() {
                                                  users.findOne(
                                                    {
                                                      _id: comments[count]
                                                        .userId,
                                                    },
                                                    function (err, user) {
                                                      dic = {
                                                        comment:
                                                          comments[count]
                                                            .comment,
                                                        postId:
                                                          comments[count]
                                                            .postId,
                                                        userId:
                                                          comments[count]
                                                            .userId,
                                                        _id: comments[count]
                                                          ._id,
                                                        user: user.name,
                                                        image: user.image,
                                                        medium: user.medium,
                                                      };

                                                      commentData.push(dic);
                                                      if (
                                                        count <
                                                        comments.length - 1
                                                      ) {
                                                        count = count + 1;
                                                        getCommentUserDetails();
                                                      } else {
                                                        dict = {
                                                          _id: doc[counter]._id,
                                                          title:
                                                            doc[counter].title,
                                                          type: doc[counter]
                                                            .type,
                                                          description:
                                                            doc[counter]
                                                              .description,
                                                          category:
                                                            cat == null
                                                              ? ""
                                                              : cat.name,
                                                          user_id:
                                                            doc[counter]
                                                              .user_id,
                                                          lat: doc[counter].lat,
                                                          long: doc[counter]
                                                            .long,
                                                          location:
                                                            doc[counter]
                                                              .location,
                                                          formatted_date:
                                                            doc[counter]
                                                              .formatted_date,
                                                          created_at:
                                                            doc[counter]
                                                              .created_at,
                                                          image:
                                                            doc[counter].image,
                                                          tags: doc[counter]
                                                            .tags,
                                                          add_user_type:
                                                            doc[counter]
                                                              .add_user_type,
                                                          likes: like,
                                                          dislikes: dislike,
                                                          comments:
                                                            commentData.length ==
                                                            0
                                                              ? null
                                                              : commentData[
                                                                  commentData.length -
                                                                    1
                                                                ],
                                                          comment_count:
                                                            commentData.length,
                                                          like_count:
                                                            like.length,
                                                          user_name:
                                                            errors.indexOf(
                                                              doc1
                                                            ) != -1
                                                              ? ""
                                                              : doc1.name,
                                                          user_image:
                                                            errors.indexOf(
                                                              doc1
                                                            ) != -1
                                                              ? ""
                                                              : doc1.image,
                                                          user_medium:
                                                            errors.indexOf(
                                                              doc1
                                                            ) != -1
                                                              ? ""
                                                              : doc1.medium,
                                                          fav:
                                                            errors.indexOf(
                                                              favour
                                                            ) == -1
                                                              ? "1"
                                                              : "0",
                                                        };
                                                        data.push(dict);

                                                        var index = data.some(
                                                          (person) =>
                                                            person._id ===
                                                            dict._id
                                                        );

                                                        index = data.some(
                                                          (person) =>
                                                            person._id ===
                                                            dict._id
                                                        );

                                                        index = data.some(
                                                          (person) =>
                                                            person._id ===
                                                            dict._id
                                                        );

                                                        counter += 1;
                                                        getdata(doc);
                                                      }
                                                    }
                                                  );
                                                }

                                                if (comments.length == 0) {
                                                  dict = {
                                                    _id: doc[counter]._id,
                                                    title: doc[counter].title,
                                                    type: doc[counter].type,
                                                    description:
                                                      doc[counter].description,
                                                    category:
                                                      cat == null
                                                        ? ""
                                                        : cat.name,
                                                    category_id:
                                                      doc[counter].category,
                                                    lat: doc[counter].lat,
                                                    long: doc[counter].long,
                                                    location:
                                                      doc[counter].location,
                                                    user_id:
                                                      doc[counter].user_id,
                                                    formatted_date:
                                                      doc[counter]
                                                        .formatted_date,
                                                    add_user_type:
                                                      doc[counter]
                                                        .add_user_type,
                                                    created_at:
                                                      doc[counter].created_at,
                                                    image:
                                                      errors.indexOf(
                                                        doc[counter].image
                                                      ) >= 0
                                                        ? ""
                                                        : doc[counter].image,
                                                    likes: like,
                                                    dislikes: dislike,
                                                    comments:
                                                      commentData.length == 0
                                                        ? null
                                                        : commentData[
                                                            commentData.length -
                                                              1
                                                          ],
                                                    comment_count:
                                                      commentData.length,
                                                    like_count: like.length,

                                                    user_name:
                                                      errors.indexOf(doc1) != -1
                                                        ? ""
                                                        : doc1.name,
                                                    user_image:
                                                      errors.indexOf(doc1) != -1
                                                        ? ""
                                                        : doc1.image,
                                                    user_medium:
                                                      errors.indexOf(doc1) != -1
                                                        ? ""
                                                        : doc1.medium,
                                                    fav:
                                                      errors.indexOf(favour) ==
                                                      -1
                                                        ? "1"
                                                        : "0",
                                                    recc_contact:
                                                      doc[counter].recc_contact,
                                                    tags: doc[counter].tags,
                                                  };
                                                  data.push(dict);
                                                  var index = data.some(
                                                    (person) =>
                                                      person._id === dict._id
                                                  );

                                                  index = data.some(
                                                    (person) =>
                                                      person._id === dict._id
                                                  );

                                                  index = data.some(
                                                    (person) =>
                                                      person._id === dict._id
                                                  );

                                                  counter += 1;
                                                  getdata(doc);
                                                } else {
                                                  getCommentUserDetails();
                                                }
                                                // getCommentUserDetails();
                                                // });
                                              }
                                            );
                                          }
                                        );
                                      }
                                    );
                                  }
                                );
                              }
                            );
                          }
                        );
                      }
                    );
                  }
                );
              }
            );
          });
        });
      } else {
        // var result = arraySort(data, ['like_count', 'comment_count'], {reverse: true});
        res.send({
          error: null,
          status: 1,
          data: data,
        });
      }
    }
  } catch (err) {
    console.log(err);
    res.send({
      error: err,
      status: 0,
      data: [],
    });
  }
};

// Delete Post ---------------------------------
exports.delete_recc = function (req, res) {
  reccomandation.remove({ _id: req.body._id }, function (err, post) {
    if (post == null) {
      res.send({
        error: err,
        status: 0,
        msg: "Try Again",
      });
    } else {
      likes.remove({ postId: req.body._id }, function (err, post) {
        notification.remove({ itemId: req.body._id }, function (err, post) {
          comments.remove({ postId: req.body._id }, function (err, post) {
            res.json({
              error: null,
              status: 1,
              msg: "Deleted Successfully",
            });
          });
        });
      });
    }
  });
};

// Update Post ---------------------------------
exports.update_recc = function (req, res) {
  reccomandation.update(
    { _id: req.body._id },
    {
      $set: {
        title: req.body.title,
        type: req.body.type,
        description: req.body.description,
        category: req.body.category,
        platform: req.body.platform,
        sub_category: req.body.sub_category,
        image: req.body.image,
        tags: req.body.tags,
        web_link: req.body.web_link,
        web_link_content: req.body.web_link_content,
        user_id: req.body.user_id,
      },
    },
    function (err, post) {
      if (post == null) {
        res.send({
          error: err,
          status: 0,
          msg: "Try Again",
        });
      } else {
        res.json({
          error: null,
          status: 1,
          msg: "Updated Successfully",
        });
      }
    }
  );
};

//***********  save(fav)_remove(unfav)_reccomandation_function **************
exports.add_remove_fav_recc = function (req, res) {
  if (req.body.type == "1") {
    var new_fav = new favourites({
      recc_id: req.body.recc_id,
      user_id: req.body.user_id,
      created_at: new Date(),
    });

    new_fav.save(function (err, recc) {
      res.send({
        data: recc,
        status: 1,
        msg: "Recommendation saved successfully!",
      });
    });
  } else {
    favourites.remove(
      { recc_id: req.body.recc_id, user_id: req.body.user_id },
      function (err, task) {
        res.send({
          data: task,
          status: 1,
          msg: "Successfully removed from saved recommendations!",
        });
      }
    );
  }
};

exports.addLike = function (req, res) {
  var new_like = new likes({
    userId: req.body.userId,
    postId: req.body.postId,
    created_on: new Date(),
  });

  new_like.save(function (err, posts) {
    res.send({
      data: posts,
      status: 1,
      error: "Like added successfully!",
    });

    dislikes.findOne(
      { userId: req.body.userId, postId: req.body.postId },
      function (err, postdislike) {
        if (postdislike != null) {
          dislikes.remove({ _id: postdislike._id }, function (err, post) {});
        }
      }
    );

    likes.find({ postId: req.body.postId }, function (err, posttdislike) {
      reccomandation.update(
        { _id: req.body.postId },
        { $set: { like_count: posttdislike.length } },
        function (err, post) {}
      );
    });

    reccomandation.findOne({ _id: req.body.postId }, function (err, post) {
      if (post != null) {
        if (post.user_id != req.body.userId) {
          users.findOne({ _id: req.body.userId }, function (err, send) {
            users.findOne({ _id: post.user_id }, function (err, recieve) {
              notification.remove(
                {
                  senderId: req.body.userId,
                  receiverId: post.user_id,
                  noti_type: "add like",
                  itemId: req.body.postId,
                },
                function (err, noti) {}
              );
              saveNotification(
                recieve.fcm_token,
                send.name + " liked your post",
                req.body.userId,
                post.user_id,
                "add like",
                req.body.postId,
                post
              );
            });
          });
        }
      }
    });
  });
};

exports.deleteLike = function (req, res) {
  likes.remove({ _id: req.body._id }, function (err, post) {
    if (post == null) {
      res.send({
        error: err,
        status: 0,
        msg: "Try Again",
      });
    } else {
      res.json({
        error: null,
        status: 1,
        msg: "Deleted Successfully",
      });

      likes.find({ postId: req.body.postId }, function (err, posttdislike) {
        reccomandation.update(
          { _id: req.body.postId },
          { $set: { like_count: posttdislike.length } },
          function (err, post) {}
        );
      });
    }
  });
};

exports.addDisLike = function (req, res) {
  var new_dislike = new dislikes({
    userId: req.body.userId,
    postId: req.body.postId,
    created_on: new Date(),
  });

  new_dislike.save(function (err, posts) {
    res.send({
      data: posts,
      status: 1,
      error: "DisLike added successfully!",
    });

    likes.findOne(
      { userId: req.body.userId, postId: req.body.postId },
      function (err, postlike) {
        if (postlike != null) {
          likes.remove({ _id: postlike._id }, function (err, post) {});
        }
      }
    );

    reccomandation.findOne({ _id: req.body.postId }, function (err, post) {
      if (post != null) {
        if (post.user_id != req.body.userId) {
          users.findOne({ _id: req.body.userId }, function (err, send) {
            users.findOne({ _id: post.user_id }, function (err, recieve) {
              saveNotification(
                recieve.fcm_token,
                send.name + " disliked your post",
                req.body.userId,
                post.user_id,
                "add dislike",
                req.body.postId,
                post
              );
            });
          });
        }
      }
    });
  });
};

exports.deleteDisLike = function (req, res) {
  dislikes.remove({ _id: req.body._id }, function (err, post) {
    if (post == null) {
      res.send({
        error: err,
        status: 0,
        msg: "Try Again",
      });
    } else {
      res.json({
        error: null,
        status: 1,
        msg: "Deleted Successfully",
      });
    }
  });
};

exports.addComment = function (req, res) {
  var new_like = new comments({
    userId: req.body.userId,
    postId: req.body.postId,
    comment: req.body.comment,
    created_on: new Date(),
  });

  new_like.save(function (err, posts) {
    res.send({
      data: posts,
      status: 1,
      error: "Like added successfully!",
    });

    comments.find({ postId: req.body.postId }, function (err, posttdislike) {
      reccomandation.update(
        { _id: req.body.postId },
        { $set: { comment_count: posttdislike.length } },
        function (err, post) {}
      );
    });

    reccomandation.findOne({ _id: req.body.postId }, function (err, post) {
      if (post != null) {
        if (post.user_id != req.body.userId) {
          users.findOne({ _id: req.body.userId }, function (err, send) {
            users.findOne({ _id: post.user_id }, function (err, recieve) {
              notification.remove(
                {
                  senderId: req.body.userId,
                  receiverId: post.user_id,
                  noti_type: "add comment",
                  itemId: req.body.postId,
                },
                function (err, noti) {}
              );
              saveNotification(
                recieve.fcm_token,
                send.name + " commented on your post",
                req.body.userId,
                post.user_id,
                "add comment",
                req.body.postId,
                post
              );
            });
          });
        }
      }
    });
  });
};

exports.deleteComment = function (req, res) {
  comments.remove({ _id: req.body._id }, function (err, post) {
    if (post == null) {
      res.send({
        error: err,
        status: 0,
        msg: "Try Again",
      });
    } else {
      res.json({
        error: null,
        status: 1,
        msg: "Deleted Successfully",
      });

      comments.find({ postId: req.body.postId }, function (err, posttdislike) {
        reccomandation.update(
          { _id: req.body.postId },
          { $set: { comment_count: posttdislike.length } },
          function (err, post) {}
        );
      });
    }
  });
};

exports.post_detail = function (req, res) {
  reccomandation.find(
    { _id: req.body.postId },
    null,
    { sort: { created_on: -1 } },
    function (err, doc) {
      var counter = 0,
        dict = {},
        data = [];

      function getUserDetails() {
        if (counter < doc.length) {
          // if(typeof(doc[counter].userId) != 'undefined'){

          users.findOne({ _id: doc[counter].user_id }, function (err, doc1) {
            likes.find({ postId: doc[counter]._id }, function (err, like) {
              dislikes.find(
                { postId: doc[counter]._id },
                function (err, dislike) {
                  comments.count(
                    { postId: doc[counter]._id },
                    function (err, comments) {
                      favourites.findOne(
                        {
                          recc_id: doc[counter]._id,
                          user_id: req.body.user_id,
                        },
                        null,
                        function (err, favour) {
                          categories.findOne(
                            { _id: doc[counter].category },
                            null,
                            function (err, cat) {
                              plaform.findOne(
                                { _id: doc[counter].platform },
                                null,
                                function (err, plat) {
                                  subcategories.findOne(
                                    { _id: doc[counter].sub_category },
                                    null,
                                    function (err, subcat) {
                                      admin.findOne(
                                        {},
                                        function (err, admindoc) {
                                          // console.log('admin', admindoc)

                                          function getname(str, user, adminc) {
                                            if (str == "name") {
                                              if (
                                                req.body.add_user_type == "user"
                                              ) {
                                                if (
                                                  errors.indexOf(user) == -1
                                                ) {
                                                  return user.name;
                                                } else {
                                                  return "";
                                                }
                                              } else {
                                                if (
                                                  errors.indexOf(adminc) == -1
                                                ) {
                                                  return adminc.firstname;
                                                } else {
                                                  return "";
                                                }
                                              }
                                            } else if (str == "image") {
                                              if (
                                                req.body.add_user_type == "user"
                                              ) {
                                                if (
                                                  errors.indexOf(user) == -1
                                                ) {
                                                  return user.image;
                                                } else {
                                                  return "";
                                                }
                                              } else {
                                                if (
                                                  errors.indexOf(adminc) == -1
                                                ) {
                                                  return adminc.image;
                                                } else {
                                                  return "";
                                                }
                                              }
                                            } else {
                                              if (errors.indexOf(user) == -1) {
                                                return user.medium;
                                              } else {
                                                return "";
                                              }
                                            }
                                          }
                                          var web_link = doc[counter].web_link;
                                          if (
                                            errors.indexOf(
                                              doc[counter].web_link
                                            ) == -1
                                          ) {
                                            if (
                                              youtube_parser(
                                                doc[counter].web_link
                                              ) != false
                                            ) {
                                              web_link = getId(
                                                doc[counter].web_link
                                              );
                                            }
                                          }
                                          var r = (
                                            "" + doc[counter].web_link
                                          ).match(/^(https?:)?\/\/[^/]+/i);

                                          // doc[counter].link = r ? r[0] : '';
                                          dict = {
                                            _id: doc[counter]._id,
                                            title: doc[counter].title,
                                            add_user_type:
                                              doc[counter].add_user_type,
                                            type: doc[counter].type,
                                            description:
                                              doc[counter].description,
                                            category:
                                              cat == null ? "" : cat.name,
                                            platform:
                                              plat == null ? "" : plat.name,
                                            sub_category:
                                              subcat == null ? "" : subcat.name,
                                            category_id: doc[counter].category,
                                            platform_id: doc[counter].platform,
                                            sub_category_id:
                                              doc[counter].sub_category,
                                            web_link: web_link,
                                            link: r ? r[0] : "",
                                            web_link_content:
                                              doc[counter].web_link_content,
                                            user_id: doc[counter].user_id,
                                            tags: doc[counter].tags,
                                            formatted_date:
                                              doc[counter].formatted_date,
                                            created_at: doc[counter].created_at,
                                            image:
                                              errors.indexOf(
                                                doc[counter].image
                                              ) >= 0
                                                ? ""
                                                : doc[counter].image,
                                            likes: like,
                                            dislikes: dislike,
                                            comment_count: comments,
                                            like_count: like.length,
                                            user_name: getname(
                                              "name",
                                              doc1,
                                              admindoc
                                            ),
                                            user_image: getname(
                                              "image",
                                              doc1,
                                              admindoc
                                            ),
                                            user_medium: getname(
                                              "medium",
                                              doc1,
                                              admindoc
                                            ),
                                            fav:
                                              errors.indexOf(favour) == -1
                                                ? "1"
                                                : "0",
                                            recc_contact:
                                              doc[counter].recc_contact,
                                            tags: doc[counter].tags,
                                          };
                                          data.push(dict);
                                          counter += 1;
                                          getUserDetails();
                                        }
                                      );
                                    }
                                  );
                                }
                              );
                            }
                          );
                        }
                      );
                    }
                  );
                }
              );
            });
          });
        } else {
          res.send({
            error: null,
            status: 1,
            data: data,
          });
        }
      }
      getUserDetails();
    }
  );
};

exports.comments_list = function (req, res) {
  var count = 0,
    commentData = [],
    dict = {};
  comments.find({ postId: req.body.post_id }, function (err, comments) {
    if (comments.length == 0) {
      res.send({
        error: null,
        status: 1,
        data: comments,
      });
    } else {
      function getCommentUserDetails() {
        users.findOne({ _id: comments[count].userId }, function (err, user) {
          dict = {
            comment: comments[count].comment,
            postId: comments[count].postId,
            userId: comments[count].userId,
            created_on: comments[count].created_on,
            _id: comments[count]._id,
            user: user.name,
            image: user.image,
            medium: user.medium,
          };
          commentData.push(dict);

          if (count < comments.length - 1) {
            count = count + 1;
            getCommentUserDetails();
          } else {
            res.send({
              error: null,
              status: 1,
              data: commentData,
            });
          }
        });
      }

      getCommentUserDetails();
    }
  });
};

function saveNotification(
  token,
  noti_body,
  senderId,
  receiverId,
  noti_type,
  itemId,
  item
) {
  console.log(senderId, receiverId, noti_type, itemId);

  var new_noti = new notification({
    senderId: senderId,
    receiverId: receiverId,
    noti_type: noti_type,
    itemId: itemId,
    read: 0,
    created_on: new Date(),
  });

  new_noti.save(function (err, recc) {
    var message = {
      //this may vary according to the message type (single recipient, multicast, topic, et cetera)
      to: token,
      collapse_key: "your_collapse_key",

      notification: {
        title: "Favreet",
        body: noti_body,
      },

      data: {
        //you can send only notification or only data(or include both)
        title: "Favreet",
        body: noti_body,
        type: noti_type,
        itemId: itemId,
        item: item,
      },
    };

    fcm.send(message, function (err, response) {
      if (err) {
        console.log("Something has gone wrong!");
      } else {
        console.log("Successfully sent with response: ", response);
      }
    });
  });
}

exports.notification_count = function (req, res) {
  notification
    .count({ receiverId: req.body.userId, read: 0 })
    .sort({ created_on: -1 })
    .exec(function (err, doc) {
      res.send({
        data: doc,
        status: 1,
        error: null,
      });
    });
};

exports.list_notification = function (req, res) {
  notification
    .find({ receiverId: req.body.userId })
    .sort({ created_on: -1 })
    .exec(function (err, doc) {
      var counter = 0,
        data = [],
        dict = {};
      function getUserDetails() {
        if (counter < doc.length) {
          users.findOne({ _id: doc[counter].senderId }, function (err, sender) {
            reccomandation.findOne(
              { _id: doc[counter].itemId },
              function (err, post) {
                function checkPost(post, type) {
                  if (type != "follow user") {
                    if (post != null) {
                      return post;
                    } else {
                      return {};
                    }
                  } else {
                    return "";
                  }
                }
                dict = {
                  senderId: doc[counter].senderId,
                  receiverId: doc[counter].receiverId,
                  noti_type: doc[counter].noti_type,
                  created_on: doc[counter].created_on,
                  sender_name: errors.indexOf(sender) == -1 ? sender.name : "",
                  sender_image:
                    errors.indexOf(sender) == -1 ? sender.image : "",
                  sender_medium:
                    errors.indexOf(sender) == -1 ? sender.medium : "",
                  read: doc[counter].read,
                  itemId: doc[counter].itemId,
                  _id: doc[counter]._id,
                  item: checkPost(post, doc[counter].noti_type),
                };
                data.push(dict);
                counter += 1;
                getUserDetails();
              }
            );
          });
        } else {
          res.send({
            data: data,
            status: 1,
            error: null,
          });
        }
      }

      getUserDetails();
    });
};

exports.read_notification = function (req, res) {
  notification.update(
    { _id: req.body.id },
    { $set: { read: 1 } },
    { $new: true },
    function (err, doc) {
      res.send({
        data: doc,
        status: 1,
        error: null,
      });
    }
  );
};

//admin side
exports.get_all_recc_admin = function (req, res) {
  reccomandation
    .find({})
    .sort({ created_at: -1 })
    .exec(function (err, doc) {
      var counter = 0,
        dict = {},
        data = [];

      function getUserDetails() {
        // console.log(doc[counter]);
        if (counter < doc.length) {
          // if(typeof(doc[counter].userId) != 'undefined'){
          likes.count({ postId: doc[counter]._id }, function (err, like) {
            dislikes.find(
              { postId: doc[counter]._id },
              function (err, dislike) {
                comments.count(
                  { postId: doc[counter]._id },
                  function (err, comments) {
                    categories.findOne(
                      { _id: doc[counter].category },
                      null,
                      function (err, cat) {
                        users.findOne(
                          { _id: doc[counter].user_id },
                          null,
                          function (err, user) {
                            admin.findOne({}, function (err, admindoc) {
                              var count = 0,
                                dic = {},
                                commentData = [];
                              function getnameuser(str, user, admin) {
                                if (doc[counter].add_user_type == "user") {
                                  if (errors.indexOf(user) == -1) {
                                    return user.name;
                                  } else {
                                    return "";
                                  }
                                } else {
                                  if (errors.indexOf(admindoc) == -1) {
                                    return admindoc.firstname;
                                  } else {
                                    return "";
                                  }
                                }
                              }

                              function getname(user, admin) {
                                if (doc[counter].add_user_type == "user") {
                                  if (errors.indexOf(user) == -1) {
                                    return user;
                                  } else {
                                    return "";
                                  }
                                } else {
                                  if (errors.indexOf(admindoc) == -1) {
                                    return admindoc;
                                  } else {
                                    return "";
                                  }
                                }
                              }
                              dict = {
                                _id: doc[counter]._id,
                                title: doc[counter].title,
                                type: doc[counter].type,
                                description: doc[counter].description,
                                category: cat == null ? "" : cat.name,
                                web_link: doc[counter].web_link,
                                user_id: doc[counter].user_id,
                                formatted_date: doc[counter].formatted_date,
                                created_at: doc[counter].created_at,
                                image: doc[counter].image,
                                add_user_type: doc[counter].add_user_type,
                                web_link_content: doc[counter].web_link_content,
                                likes: like,
                                dislikes: dislike,
                                comments: comments,
                                user: getname(user, admindoc),
                                user_name: getnameuser("name", user, admindoc),
                              };
                              data.push(dict);
                              if (counter < doc.length - 1) {
                                counter += 1;
                                getUserDetails();
                              } else {
                                res.send({
                                  error: null,
                                  status: 1,
                                  data: data,
                                });
                              }
                            });
                          }
                        );
                      }
                    );
                  }
                );
              }
            );
          });
        } else {
          res.send({
            error: null,
            status: 1,
            data: data,
          });
        }
      }
      getUserDetails();
    });
};

exports.get_post_comments = function (req, res) {
  comments
    .find({ postId: req.body.postId })
    .sort({ created_at: -1 })
    .exec(function (err, doc) {
      var counter = 0,
        dict = {},
        data = [];
      if (doc.length > 0) {
        function getUserDetails() {
          users.findOne(
            { _id: doc[counter].userId },
            null,
            function (err, user) {
              dict = {
                comment: doc[counter].comment,
                postId: doc[counter].postId,
                userId: doc[counter].userId,
                _id: doc[counter]._id,
                created_on: doc[counter].created_on,
                user: user.name,
                image: user.image,
                medium: user.medium,
              };
              data.push(dict);
              if (counter < doc.length - 1) {
                counter += 1;
                getUserDetails();
              } else {
                res.send({
                  error: null,
                  status: 1,
                  data: data,
                });
              }
            }
          );
        }
        getUserDetails();
      } else {
        res.send({
          data: doc,
          status: 1,
          error: null,
        });
      }
    });
};
const { linkPreview } = require("link-preview-node");
const { exec } = require("child_process");
exports.scrapUrl = function (req, res) {
  linkPreview(req.body.url)
    .then((resp) => {
      res.send({
        data: resp,
      });
      /* { image: 'https://static.npmjs.com/338e4905a2684ca96e08c7780fc68412.png',
            title: 'npm | build amazing things',
            description: '',
            link: 'http://npmjs.com' } */
      // Note that '' is used when value of any detail of the link is not available
    })
    .catch((catchErr) => {
      console.log(catchErr);
      res.send({
        data: null,
      });
    });

  // var jsdom = require( 'jsdom' );
  // var jsonRes = {};
  // jsdom.env( {
  //     url: req.body.url,
  //     scripts: [ "http://code.jquery.com/jquery.js" ],
  //     done: function( error, window ) {
  //       var $ = window.$;

  //       $( 'meta' ).each( function() {
  //         var name = $( this ).attr( 'property' );
  //         var value = $( this ).attr( 'content' );
  //         if ( name ) {
  //           jsonRes[ name.slice( 3 ) ] = value;
  //           console.log( name + ": " + value );
  //         }
  //       } );
  //       res.send( jsonRes );
  //     }
  // } );
};

exports.addFeedback = function (req, res) {
  console.log(req.body);
  try {
    var dict = {
      name: req.body.name,
      email: req.body.email,
      message: req.body.message,
    };
    console.log(dict);

    var newFeedback = new feedback(dict);
    newFeedback.save(function (err, recc) {
      res.send({
        status: 1,
        msg: "Feedback added successfully",
      });
    });
  } catch (err) {
    res.send({
      status: 0,
      err: err,
    });
  }
};

exports.friendsRecommendations = function (req, res) {
  var dict = {};
  try {
    friendsrecommendations.find(
      { postId: req.body.postId, fromId: req.body.fromId },
      function (err, doc1) {
        if (doc1.length == 0) {
          dict = {
            fromId: req.body.fromId,
            toId: req.body.toId,
            postId: req.body.postId,
          };
          var seefriendsRecommendations = new friendsrecommendations(dict);
          // save_recc_noti(dict);
          // seefriendsRecommendations.save(function (err, recc) {
          //   res.send({
          //     status: 1,
          //     msg: "Recommendation Sent successfully",
          //   });
          // });

          users.findOne({ _id: req.body.fromId }, function (err, doc1) {
            notification.remove(
              {
                senderId: req.body.fromId,
                receiverId: req.body.toId,
                noti_type: "friends recc",
                itemId: req.body.postId,
              },
              function (err, noti) {
                var new_noti = new notification({
                  senderId: req.body.fromId,
                  receiverId: req.body.toId,
                  noti_type: "friends recc",
                  itemId: req.body.postId,
                  read: 0,
                  created_on: new Date(),
                });

                new_noti.save(function (err, recc) {
                  res.send({
                    status: 1,
                    err: err,
                    data: recc,
                  });
                });
              }
            );
          });
        } else {
          friendsrecommendations.update(
            {
              postId: req.body.postId,
              fromId: req.body.fromId,
            },
            { $set: { toId: req.body.toId } },
            function (err, doc1) {
              reccnotification.findOne(
                {
                  itemId: req.body.postId,
                  senderId: req.body.fromId,
                },
                function (err, doc2) {
                  if (doc2 == null) {
                    dict = {
                      fromId: req.body.fromId,
                      toId: req.body.toId,
                      postId: req.body.postId,
                    };
                    save_recc_noti(dict);
                  } else {
                    reccnotification.update(
                      {
                        itemId: req.body.postId,
                        senderId: req.body.fromId,
                      },
                      { $set: { receiverId: req.body.toId } },
                      function (err, doc2) {
                        console.log("doc2", doc2);
                      }
                    );
                  }
                }
              );
              res.send({
                status: 1,
                msg: "Recommendation Sent successfully",
              });
            }
          );
        }
      }
    );
  } catch (err) {
    res.send({
      status: 0,
      err: err,
    });
  }
};

function save_recc_noti(dict) {
  console.log("save_recc_noti", dict);
  var recc_noti = new reccnotification({
    senderId: dict.fromId,
    receiverId: dict.toId,
    itemId: dict.postId,
    read: 0,
    created_on: new Date(),
  });
  recc_noti.save(function (err, recc) {});
}

exports.getAllFriendSuggestions = function (req, res) {
  notification
    .find({
      senderId: req.body.fromId,
      itemId: req.body.postId,
      noti_type: "friends recc",
    })
    .exec(function (err, doc) {
      if (doc.length == 0) {
        res.send({
          error: err,
          status: 0,
          data: [],
        });
      } else {
        res.send({
          error: null,
          status: 1,
          data: doc,
        });
      }
    });
};

// exports.list_recc_notification = function (req, res) {
//   notification
//     .find({ receiverId: { $in: req.body.userId } })
//     .sort({ created_on: -1 })
//     .exec(function (err, doc) {
//       var counter = 0,
//         data = [],
//         dict = {};
//       console.log("notification", doc);
//       function getUserDetails() {
//         if (counter < doc.length) {
//           users.findOne({ _id: doc[counter].senderId }, function (err, sender) {
//             reccomandation.findOne(
//               { _id: doc[counter].itemId },
//               function (err, post) {
//                 dict = {
//                   senderId: doc[counter].senderId,
//                   receiverId: doc[counter].receiverId,
//                   noti_type: doc[counter].noti_type,
//                   created_on: doc[counter].created_on,
//                   sender_name: errors.indexOf(sender) == -1 ? sender.name : "",
//                   sender_image:
//                     errors.indexOf(sender) == -1 ? sender.image : "",
//                   sender_medium:
//                     errors.indexOf(sender) == -1 ? sender.medium : "",
//                   read: doc[counter].read,
//                   itemId: doc[counter].itemId,
//                   _id: doc[counter]._id,
//                   item: checkPost(post, doc[counter].noti_type),
//                 };
//                 data.push(dict);
//                 counter += 1;
//                 getUserDetails();
//               }
//             );
//           });
//         } else {
//           res.send({
//             data: data,
//             status: 1,
//             error: null,
//           });
//         }
//       }

//       getUserDetails();
//     });
// };

exports.recc_posts_list = function (req, res) {
  reccnotification
    .find({ receiverId: req.body.userId })
    .sort({ created_on: -1 })
    .exec(function (err, doc) {
      var counter = 0,
        data = [],
        dict = {};
      function getUserDetails() {
        console.log("counter", counter);
        if (counter < doc.length) {
          users.findOne({ _id: doc[counter].senderId }, function (err, sender) {
            reccomandation.findOne(
              { _id: doc[counter].itemId },
              function (err, post) {
                function checkPost(post, type) {
                  if (type != "follow user") {
                    if (post != null) {
                      return post;
                    } else {
                      return {};
                    }
                  } else {
                    return "";
                  }
                }
                dict = {
                  senderId: doc[counter].senderId,
                  receiverId: doc[counter].receiverId,
                  noti_type: doc[counter].noti_type,
                  created_on: doc[counter].created_on,
                  sender_name: errors.indexOf(sender) == -1 ? sender.name : "",
                  sender_image:
                    errors.indexOf(sender) == -1 ? sender.image : "",
                  sender_medium:
                    errors.indexOf(sender) == -1 ? sender.medium : "",
                  read: doc[counter].read,
                  itemId: doc[counter].itemId,
                  _id: doc[counter]._id,
                  item: checkPost(post, doc[counter].noti_type),
                };
                data.push(dict);
                counter += 1;
                getUserDetails();
              }
            );
          });
        } else {
          res.send({
            data: data,
            status: 1,
            error: null,
          });
        }
      }

      getUserDetails();
    });
};

exports.get_all_feedback = function (req, res) {
  feedbacks
    .find()
    .sort({ created_on: -1 })
    .exec(function (err, doc) {
      if (doc.length == 0) {
        res.send({
          error: err,
          status: 0,
          data: [],
        });
      } else {
        res.send({
          error: null,
          status: 1,
          data: doc,
        });
      }
    });
};

exports.filter_search = function (req, res) {
  var counter = 0;
  var counter2 = 0;
  var keywordPosts = [];
  var keywordUsers = [];
  console.log("====", req.body);
  reccomandation.find(
    {
      $or: [
        { title: { $regex: req.body.keyword, $options: "$i" } },
        { description: { $regex: req.body.keyword, $options: "$i" } },
        { tags: { $elemMatch: { name: req.body.keyword } } },
      ],
    },
    function (err, doc) {
      console.log("docc length", doc.length);
      if (doc.length == 0) {
        users.find(
          {
            name: { $regex: req.body.keyword, $options: "$i" },
          },
          function (err, doc1) {
            if (doc1.length == 0) {
              res.send({
                data: [],
              });
            } else {
              doc1.forEach((element) => {
                var dict = {
                  type: "user",
                  name: element.name,
                  description: element.description,
                  tags: element.tags,
                  upper_name: element.name.toUpperCase(),
                  id: element._id,
                  data: element,
                };

                keywordUsers.push(dict);

                const arrayUniqueByKey = [
                  ...new Map(
                    keywordUsers.map((item) => [item["upper_name"], item])
                  ).values(),
                ];
                counter2 = counter2 + 1;
                if (counter2 == doc1.length) {
                  res.send(arrayUniqueByKey);
                }
              });
            }

            const arrayUniqueByKeyUser = [
              ...new Map(
                keywordUsers.map((item) => [item["upper_name"], item])
              ).values(),
            ];

            const arrayUniqueByKeyPost = [
              ...new Map(
                keywordPosts.map((item) => [item["upper_name"], item])
              ).values(),
            ];

            const combined = [...arrayUniqueByKeyUser, ...arrayUniqueByKeyPost];
            res.send(combined);
          }
        );
      } else {
        doc.forEach((element) => {
          var dict = {
            type: "post",
            name: element.title,
            description: element.description,
            tags: element.tags,
            upper_name: element.title.toUpperCase(),
            id: element._id,
          };
          keywordPosts.push(dict);
          counter = counter + 1;
          if (counter == doc.length) {
            users.find(
              {
                name: { $regex: req.body.keyword, $options: "$i" },
              },
              function (err, doc1) {
                if (doc1.length == 0) {
                  res.send(keywordPosts);
                } else {
                  doc1.forEach((element) => {
                    var dict = {
                      type: "user",
                      name: element.name,
                      description: element.description,
                      tags: element.tags,
                      upper_name: element.name.toUpperCase(),
                      id: element._id,
                      data: element,
                    };
                    keywordUsers.push(dict);
                    counter2 = counter2 + 1;
                    if (counter2 == doc1.length) {
                      const arrayUniqueByKeyUser = [
                        ...new Map(
                          keywordUsers.map((item) => [item["upper_name"], item])
                        ).values(),
                      ];

                      const arrayUniqueByKeyPost = [
                        ...new Map(
                          keywordPosts.map((item) => [item["upper_name"], item])
                        ).values(),
                      ];

                      const combined = [...keywordUsers, ...keywordPosts];
                      res.send(combined);
                    }
                  });
                }
              }
            );
          }
        });
      }
    }
  );
};
