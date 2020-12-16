import { React, Component } from "react";
import {
  Typography,
  Paper,
  Grid,
  Container,
  Button,
  Card,
  CardActions,
  CardContent,
  CardMedia,
  TextareaAutosize
} from "@material-ui/core";
import Alert from '@material-ui/lab/Alert';
import { Row, Col, Tab, Tabs } from "react-bootstrap";
import { GetCookie, toJSDate, timeSince } from "../UtilityFunctions";
import { BlogCards } from "./BlogCards";
import Comment from "./Comment"

// shows details in the dashboard for individual groups
export class Group extends Component {
  constructor(props) {
    super(props);
    this.state = {
      value: "home",
      newComment: '',
      data: '',
      requests: '',
      commentData: '',
      showSuccess: false,
      moreResults: true,
      page: 1
    };
    this.onClick = this.onClick.bind(this);
  }

  componentDidMount() {
    var auth = GetCookie("access_token");
    console.log(auth);
    var groupId = this.props.location.pathname.split("/", 3)[2];
    this.getGroup(auth, groupId);
    this.getGroupComments(auth, groupId, 1)
    this.setState({
      auth: auth,
      groupId: groupId
    })
  }

  onClick() {
    this.setState({
      showBlog: true,
    });
  }

  handleChange(k) {
    this.setState({
      value: k,
    });
  }

  handleNewTLCommentChange = (event) => {
    this.setState({
      newComment: event.target.value
    })
  };

  onSave(group) {
    console.log("CLICK CLICK", group);
    group.isSaved === true
      ? this.unsaveGroup(this.state.auth, group.groupId)
      : this.saveGroup(this.state.auth, group.groupId)
  }

  clickSubmitHandler() {
    if (this.state.newComment.length < 1) {
      this.setState({
        showError: true,
        errorMessage: 'Empty comment'
      })
    } else if (this.state.newComment.length > 100) {
      this.setState({
        showError: true,
        errorMessage: 'Comment must be under 100 characters'
      })
    } else {
      this.createGroupComment(this.state.auth, this.state.data.groupId, this.state.newComment, 0)
      this.setState({
        showSuccess: true
      })
    }
  }

  removeAlert() {
    this.setState({
      showError: false,
      errorMessage: "",
    });
  }

    removeSuccessAlert() {
    this.setState({ showSuccess: false });
  }


  // loads the group info about the group
  // gets group name as prop from Groups
  // shows edit and accept options if user is admin
  render() {
    const ErrorAlert = () => {
      if (this.state.showError === true) {
        return (
          <Alert style={{ float: "right" }} severity="error" onClose={() => this.removeAlert()} dismissible>
            {this.state.errorMessage}
          </Alert>
        )
      } else {
        return null
      }
    }

     const SuccessAlert = () => {
      if (this.state.showSuccess === true) {
        return (
          <Alert
            severity="success"
            onClose={() => this.removeSuccessAlert()}
            dismissible
          >
            Comment posted!
          </Alert>
        );
      } else {
        return null;
      }
    };

    /*|| this.state.data.isAdmin*/
    const RequestElement = () => {
      if(this.state.data.joinedStatus === "Joined") {
        return (
          <Button size="medium" color="primary" onClick={() => this.leaveGroup(this.state.auth, this.state.data.groupId)}> 
          Leave Group</Button>
        )
      } else if (this.state.data.joinedStatus === "Pending") {
        return (
          <Typography variant="subtitle1" color="textPrimary">
          Request Pending
        </Typography>
        )
      } else if (this.state.data.isAdmin === true) {
        return (
          <Typography alignRight variant="subtitle1" color="textPrimary">
          Admin
        </Typography>
        )
      }  else {
        return (
          <Button size="medium" color="primary" onClick={() => this.createMembershipRequest(this.state.auth, this.state.data.groupId)}> 
          Request to Join</Button>
        )
      }  
    }

    if (this.state.data !== '') {
      return (
        <div>
          <Container maxWidth="md">
            <Typography
              component="h2"
              variant="h2"
              align="center"
              color="textPrimary"
              gutterBottom
            >
              {this.state.data.groupName}
            </Typography>
            <hr
              style={{
                marginTop: "-1rem",
                backgroundColor: "#3399FF",
                width: "200px",
                height: "3px",
              }}
            />
            <Paper variant="elevation" style={{ padding: "5px", marginBottom:"20px"}}>
              <Tabs
                id="controlled-tab-example"
                activeKey={this.state.value}
                onSelect={(k) => this.handleChange(k)}
              >
                <Tab eventKey="home" title="Group Description">
                  <Row>
                    <Col className="pt-2 pl-3">
                      <div style={{ width: "100%", marginBottom: "5px", marginLeft:"5px" }}>
                        <img
                          style={{
                            maxWidth: "500px",
                            maxHeight: "400px",
                            display: "block",
                           
                          }}
                          src="https://source.unsplash.com/random"
                          alt="random pic"
                        />
                      </div>
                    </Col>
                    <Col className="mt-5 p-3">
                    <Row>
                    <Col>
                    {this.state.auth !== '' ?  <RequestElement></RequestElement> : null}
                    </Col>
                    <Col >
                    {this.state.auth !== '' ? <Button size="medium" color="primary" onClick={() => this.onSave(this.state.data)}>
                      {this.state.data.isSaved === true ? "Unsave" : "Save"}</Button> : null}
                      </Col>
                    </Row>
                      <Typography
                        component="h6"
                        variant="h6"
                        align="left"
                        color="textSecondary"
                      >
                       {this.state.data.groupDescription === "" ? "No group description." : this.state.data.groupDescription}
                      </Typography>
                      <Typography variant="subtitle1" color="textPrimary">
                        Created by {this.state.data.isAdmin ? "you" : (this.state.data.user.firstName + " " + this.state.data.user.lastName)} <time class="timeago" dateTime={toJSDate(this.state.data.createdAt)} title={toJSDate(this.state.data.createdAt)}>{timeSince(toJSDate(this.state.data.createdAt))}</time> ago in {this.state.data.category.categoryName}
                      </Typography>
                    </Col>
                  </Row>
                  <Row>
                    <Col>
                      <br></br>
                      {this.state.auth !== '' ? 
                      <div>
                        <Typography variant="subtitle1" color="textPrimary">
                        Leave a comment
                        </Typography>
                      <TextareaAutosize style={{ width: "100%" }} label="top level comment" rowsMin={3} onChange={this.handleNewTLCommentChange} />
                      <Button style={{ marginBottom: "15px" }} size="medium" color="primary" onClick={() => this.clickSubmitHandler()}>Create Comment</Button>
                      <ErrorAlert></ErrorAlert>
                      <SuccessAlert></SuccessAlert>
                      <hr
                        style={{
                          marginTop: "-10px",
                        }}
                      />
                      </div> : null}
                      <Typography
                        component="h6"
                        variant="h6"
                        align="left"
                        color="textSecondary"
                      >
                        Comments
                        </Typography>
                      <hr
                        style={{
                          marginTop: "5px",
                          width: "100%",
                          marginBottom: "2px"
                        }}
                      />
                    </Col>
                  </Row>
                  <Row>
                    <Col>
                      {this.state.commentData !== '' ? <Comment isAdmin={this.state.data.isAdmin} auth={this.state.auth} groupId={this.state.groupId} commentData={this.state.commentData} moreResults={this.state.moreResults} /> : null}
                      {this.state.moreResults && this.state.commentData.length > 2 ? <Button size="large" color="primary" onClick={() => this.getGroupComments(this.state.auth, this.state.groupId, this.state.page + 1)}>
                        Show more comments</Button> : null}
                    </Col>
                  </Row>
                </Tab>
                <Tab eventKey="blog" title="Blog Posts">
                  <BlogCards
                   groupId={this.state.groupId}
                   data = {this.state.data}
                   isAdmin = {this.state.data.isAdmin}
                   auth = {this.state.auth}
                  />
                </Tab>
                {this.state.data.isAdmin ? <Tab eventKey="profile" title="Member Requests">
                <div style={{padding: "8px"}}>
                  <Grid container spacing={4}>
                    {this.state.requests !== '' && this.state.requests.length > 0 ? this.state.requests.map((request) => (
                      <Grid item key={request} xs={4} sm={3} md={3}>
                        <Card
                          style={{
                            height: "100%",
                            display: "flex",
                            flexDirection: "column",
                          }}
                        >
                          <CardMedia
                            style={{ paddingTop: "56.25%" }}
                            image="https://source.unsplash.com/random"
                            title="Image title"
                          />
                          <CardContent style={{ flexGrow: 1 }}>
                            <Typography
                              gutterBottom
                              variant="h5"
                              component="h2"
                            >
                              {request.user.firstName} {request.user.lastName}
                            </Typography>
                          </CardContent>
                          <CardActions>
                            <Button
                              size="small"
                              color="primary"
                              onClick={() => this.acceptMembershipRequest(this.state.auth, this.state.data.groupId, request.membershipID)}
                            >
                              Accept
                            </Button>
                            <Button
                              size="small"
                              color="primary"
                              onClick={() => this.declineMembershipRequest(this.state.auth, this.state.data.groupId, request.membershipID)}
                            >
                              Reject
                            </Button>
                          </CardActions>
                        </Card>
                      </Grid>
                    )) : <bold style={{marginLeft: "10px", marginTop: "20px", marginBottom: "10px"}}>No membership requests to display</bold>}
                  </Grid>
                  </div>
                </Tab> : null}
              </Tabs>
            </Paper>
          </Container>
        </div>
      );
    } else if (this.state.notFound) {
      return <p style = {{textAlign:"center", fontSize:"40px"}}>404 Page Not Found</p>
    }

    return null;
  }

  createGroupComment = (auth, groupId, commentContent, replyId) => {
    var body
    setTimeout(() => {
      if (replyId > 0) {
        body =
        {
          "replyId": {
            "Int64": replyId,
            "Valid": true
          },
          "commentContent": commentContent
        }
      } else {
        body =
        {
          "commentContent": commentContent
        }
      }

      var url = "https://groups.cahillaw.me/v1/groups/" + groupId + "/comments"
      fetch(url, {
        method: 'post',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': auth
        },
        body: JSON.stringify(body)
      })
        .then((response) => {
          if (response.status <= 201) {
            response.json().then((data) => {
              console.log(data)
              var commentData = this.state.commentData
              commentData.unshift(data)
              this.setState({
                commentData: commentData
              })
            })
          } else {
            console.log("failed :(", response.status)
          }
        })
    }, 0)
  }

  getGroup = (auth, groupId) => {
    setTimeout(() => {
      console.log(auth);
      var url = "https://groups.cahillaw.me/v1/groups/" + groupId;
      fetch(url, {
        method: "get",
        headers: {
          "Content-Type": "application/json",
          Authorization: auth,
        },
      }).then((response) => {
        if (response.status <= 201) {
          response.json().then((data) => {
            console.log(data);
            console.log(data.isJoined)
            if(data.isAdmin) {
              this.getMembersipRequests(auth, groupId)
            }
            this.setState({
              data: data
            });
          });
        } else {
          console.log("failed :(");
          this.setState({
            notFound: true
          })
        }
      });
    }, 0);
  };

  getMembersipRequests = (auth, groupId) => {
    setTimeout(() => {
      var url = "https://groups.cahillaw.me/v1/groups/" + groupId + "/requests";

      fetch(url, {
        method: "get",
        headers: {
          "Content-Type": "application/json",
          Authorization: auth,
        },
      }).then((response) => {
        if (response.status <= 201) {
          response.json().then((data) => {
            console.log(data);
            this.setState({
              requests: data
            })
          });
        } else {
          console.log("failed :(");
        }
      });
    }, 0);
  };

  createMembershipRequest = (auth, groupId) => {
    setTimeout(() => {
      var url = "https://groups.cahillaw.me/v1/groups/" + groupId + "/requests";
      fetch(url, {
        method: "post",
        headers: {
          "Content-Type": "application/json",
          Authorization: auth,
        },
      }).then((response) => {
        if (response.status <= 201) {
          var data = this.state.data
          data.joinedStatus = "Pending"
          this.setState({
            data: data
          })
          console.log("success");
        } else {
          console.log("failed :(", response.status);
        }
      });
    }, 0);
  };

  acceptMembershipRequest = (auth, groupId, requestId) => {
    setTimeout(() => {
      var url =
        "https://groups.cahillaw.me/v1/groups/" +
        groupId +
        "/requests/" +
        requestId;
      fetch(url, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: auth,
        },
      }).then((response) => {
        if (response.status <= 201) {
          console.log("success");
          this.removeFromRequests(requestId)
        } else {
          console.log("failed :(", response.status);
        }
      });
    }, 0);
  };

  declineMembershipRequest = (auth, groupId, requestId) => {
    setTimeout(() => {
      var url =
        "https://groups.cahillaw.me/v1/groups/" +
        groupId +
        "/requests/" +
        requestId;
      fetch(url, {
        method: "delete",
        headers: {
          "Content-Type": "application/json",
          Authorization: auth,
        },
      }).then((response) => {
        if (response.status <= 201) {
          console.log("success");
          this.removeFromRequests(requestId) 
        } else {
          console.log("failed :(", response.status);
        }
      });
    }, 0);
  };

  saveGroup = (auth, groupId) => {
    setTimeout(() => {
      var url = "https://groups.cahillaw.me/v1/groups/" + groupId + "/save"
      fetch(url, {
        method: 'post',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': auth
        }
      })
        .then((response) => {
          if (response.status <= 201) {
            console.log("success")
            var data = this.state.data
            data.isSaved = true
            this.setState({
              data: data
            })
          } else {
            console.log("failed :(", response.status)
          }
        })
    }, 0)
  }

  unsaveGroup = (auth, groupId) => {
    setTimeout(() => {
      var url = "https://groups.cahillaw.me/v1/groups/" + groupId + "/save"
      fetch(url, {
        method: 'delete',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': auth
        }
      })
        .then((response) => {
          if (response.status <= 201) {
            console.log("success")
            var data = this.state.data
            data.isSaved = false
            this.setState({
              data: data
            })
          } else {
            console.log("failed :(", response.status)
          }
        })
    }, 0)
  }

  getGroupComments = (auth, groupId, page) => {
    setTimeout(() => {
      var url =
        "https://groups.cahillaw.me/v1/groups/" + groupId + "/comments?";
      if (page !== "") {
        url = url + "page=" + page;
      }

      fetch(url, {
        method: "get",
        headers: {
          "Content-Type": "application/json",
          Authorization: auth,
        },
      }).then((response) => {
        if (response.status <= 201) {
          response.json().then((data) => {
            console.log("GET COMMENTS", data);
            if(page === 1) {
              this.setState({
                commentData: data,
              });
            } else {
              var newData = this.state.commentData.concat(data)
              console.log(newData.length)
              if(newData.length % 3 !== 0 || data.length === 0) {
                this.setState({
                  moreResults: false,
                  commentData: newData,
                  page: this.state.page + 1
                })
              } else {
                this.setState({
                  commentData: newData,
                  page: this.state.page + 1
                })
              }
            }
          });
        } else {
          console.log("failed :(");
        }
      });
    }, 0);
  };

  leaveGroup = (auth, groupId) => {
    setTimeout(() => {
      var url = "https://groups.cahillaw.me/v1/groups/" + groupId + "/requests"
      fetch(url, {
        method: 'delete',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': auth
        }
      })
        .then((response) => {
          if (response.status <= 201) {
            console.log("success")
            var data = this.state.data
            data.joinedStatus = "NA"
            this.setState({
              data: data
            })
          } else {
            console.log("failed :(", response.status)
          }
        })
    }, 0)
  }

  removeFromRequests = (membershipID) => {
    var requests = this.state.requests
    for(var i = 0; i<requests.length; i++) {
      if (requests[i].membershipID === membershipID) {
        requests.splice(i, 1)
        break
      }
    }

    this.setState({
      requests: requests
    })
  }
}
