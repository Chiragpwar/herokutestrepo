import {Component, OnInit, ViewChild, ElementRef, NgZone, HostListener} from '@angular/core';
import {Router, ActivatedRoute} from '@angular/router';
import {Chatroom, Mediastream} from '../../../modals/modal';
import { ToastrService } from 'ngx-toastr';
import { NgxSpinnerService } from 'ngx-spinner';
import { ClipboardService } from 'ngx-clipboard';
import * as RecordRTC from 'recordrtc';
import { Socket } from 'ngx-socket-io';
import {AuthServices} from '../../../service/CommenService';
import { DomSanitizer} from '@angular/platform-browser';
import {DataService} from '../../../service/sharedservice';
import { async } from 'rxjs/internal/scheduler/async';

declare var $: any;
declare var window: Window;
declare global {
  interface Window {
    RTCPeerConnection: RTCPeerConnection;
    mozRTCPeerConnection: RTCPeerConnection;
    webkitRTCPeerConnection: RTCPeerConnection;
  }
}
@Component({selector: 'app-cam', templateUrl: './cam.component.html', styleUrls: ['./cam.component.scss']})

export class CamComponent implements OnInit {
  public now: Date = new Date();
  constructor(private route: ActivatedRoute, private Routes: Router, private toastr: ToastrService,
              private spinner: NgxSpinnerService, private clipboardService: ClipboardService, private socket: Socket,
              private service: AuthServices, private sanitizer: DomSanitizer,
              private dataservice: DataService, private zone: NgZone) {}

  @ViewChild('startButton', null) startButton: ElementRef;
  @ViewChild('callButton', null) callButton: ElementRef;
  @ViewChild('hangupButton', null) hangupButton: ElementRef;
  @ViewChild('localvideo', null) localvideo: ElementRef;
  @ViewChild('remotevideo', null) remotevideo;
  @ViewChild('player', null) player: ElementRef;
  @ViewChild('video', null) video;
  @ViewChild('videoModal', null) videoModal;
  @ViewChild('submit_message', null) submitmessage: ElementRef;
 // window: Window & typeof globalThis;
  private stream: MediaStream;
  streams = new Mediastream();
  chatcount = true;
  unreadmsg = false;
  private recordRTC: any;
  Record = true;
  userImage = false;
  Url: string;
  pics = 'assets/icon.png';
  pic: any;
  chatpic = '';
  name: string;
  media: any;
  startButtonDisabled = false;
  callButtonDisabled = true;
  hangupButtonDisabled = true;
  startTime;
  localStream;
  pc1;
  pc2;
  currentUser: any;
  offerOptions = {
    offerToReceiveAudio: 1,
    offerToReceiveVideo: 1
  };
  sender: string;
  receiver: string;
  usersdata = [];
  ownerdata = [];
  username = [];
  datastream: any = [];
  owner: string;
  Guest: string;
  Currentowner: any;
  chat = new Chatroom();
  content: HTMLElement;
  poster = [];
  app: any;
  communication = [];
  speakers = [];
  Videoplayer = [];
  right: any;
  loading = false;
  mic: string;
  mictext = 'Mic On';
  micon = 'assets/micon.png';
  micoff = 'assets/micoff.png';
 localvideodata: any;
 remotevideodata: any;
 VideoPlayername: any;
 Camon = '';
 emojiopen = false;
  pc: any;
 // tslint:disable-next-line: object-literal-key-quotes
 conf: RTCConfiguration = {'iceServers': [
  // tslint:disable-next-line: object-literal-key-quotes
  { 'urls': 'stun:numb.viagenie.ca'}
]};

 configuration = {
  iceServers: [{
    urls: 'stun:stun.l.google.com:19302'
  }]
};
 private ipRegex = new RegExp(/([0-9]{1,3}(\.[0-9]{1,3}){3}|[a-f0-9]{1,4}(:[a-f0-9]{1,4}){7})/);

 async ngOnInit() {
    this.pc1 = new RTCPeerConnection(this.conf);
    this.pc2 = new RTCPeerConnection(this.conf);
    this.Camon = 'enable';
    this.content = document.querySelector('#chat');
    this.mic = this.micon;
   // this.startRecording();
   // this.spinner.show();
    this.GetuserDetial();
    this.Socketjoin();
    this.RoomCheck();
    this.initializeplayer();
   // this.socketmsg();

    this.socket.on('message', (username) => {
        this.scrollBottom();
        if (this.name === username.username) {
           this.owner = username.username;
           this.pic = username.pic;
           this.usersdata.push(username);
           } else {
             this.pic = username.pic;
             this.usersdata.push(username);
           }
        if (this.unreadmsg) {
            this.chatcount = true;
          } else {
            const user = this.currentUser !== null ?  'Guest' : this.Currentowner;
            if (this.usersdata.length === 1) {
              this.toastr.info(username.message, user);
            }
            this.chatcount = false;
          }
   });

    this.socket.on('sharescreen', async (val)  => {
      if (val.val.MediaStream !== '') {
        if (this.currentUser != null) {
          const video: HTMLVideoElement = this.localvideo.nativeElement;
          video.poster = '';
          video.src = val.val.MediaStream;
        } else {
          const video: HTMLVideoElement = this.remotevideo.nativeElement;
          video.poster = '';
          video.src = val.val.MediaStream;
        }
      } else {
        this.loading = true;
      }
    });

    this.socket.on('stopScreen', async (val) => {
      if (val.val != null) {
          const remotevideo: HTMLVideoElement = this.remotevideo.nativeElement;
          remotevideo.style.height = '100%';
          remotevideo.srcObject = null;
          remotevideo.style.backgroundImage = 'linear-gradient(40deg, #1f83c2, transparent)';
          const localvideo: HTMLVideoElement = this.localvideo.nativeElement;
          localvideo.style.height = '100%';
          localvideo.srcObject = null;
          localvideo.style.backgroundImage = 'linear-gradient(40deg, #1f83c2, transparent)';
      }
    });

    this.socket.on('setposter', async (val) => {
    if (val.poster.video === 'remotevideo') {
      const video: HTMLVideoElement = this.remotevideo.nativeElement;
      video.poster = val.poster.poster;
      setTimeout(() => {
        video.poster = '';
      }, 8000);
      video.style.height = '100%';
    } else {
      const video: HTMLVideoElement = this.localvideo.nativeElement;
      video.poster = val.poster.poster;
      setTimeout(() => {
        video.poster = '';
      }, 8000);
      video.style.height = '100%';
    }
    });

    this.socket.on('streaming', (val) => {
      this.calltest(val);
 });

    this.socket.on('meetingend', (val) => {
    this.toastr.info(`${val.stream} has end the meeting`);
    });

    this.socket.on('leftstream', (val) => {
      this.toastr.info(`${val.name} has end the meeting`);
      if (this.currentUser != null) {
        const video: HTMLVideoElement = this.remotevideo.nativeElement;
        video.srcObject = val.stream;
       } else {
        const video: HTMLVideoElement = this.localvideo.nativeElement;
        video.srcObject = val.stream;
       }
      });

    this.socket.on('calluser', (val) => {
     // this.start();
     if (val.val.MediaStream !== '') {
      if (val.val.Player === 'Local') {
        const video: HTMLVideoElement = this.localvideo.nativeElement;
        video.src = val.val.MediaStream;
        video.style.height = '100%';
       } else {
        const video: HTMLVideoElement = this.remotevideo.nativeElement;
        video.src = val.val.MediaStream;
        video.style.height = '100%';
       }
     }
    });

    this.socket.on('CloseStream', (val) => {
       if (this.currentUser != null) {
        const video: HTMLVideoElement = this.remotevideo.nativeElement;
        video.srcObject = val.stream;
       } else {
        const video: HTMLVideoElement = this.localvideo.nativeElement;
        video.srcObject = val.stream;
       }
    });
  }

   public RoomCheck() {
    this.route.paramMap.subscribe(params => {
      // tslint:disable-next-line: no-string-literal
      this.chat.Roomname = params['params'].RoomName;
      this.service.GetRoom(this.chat.Roomname).subscribe(Response => {
        const videolocal: HTMLVideoElement = this.localvideo.nativeElement;
        videolocal.muted = true;
        const videoRemote: HTMLVideoElement = this.remotevideo.nativeElement;
        videoRemote.muted = true;
        // tslint:disable-next-line: no-string-literal
        if (Response['Roomname'] !=  null) {
          // tslint:disable-next-line: no-string-literal
          this.Currentowner = Response['name'];
          this.getip();
          // tslint:disable-next-line: no-string-literal
          this.chatpic = Response['photoUrl'];
          navigator.mediaDevices.getUserMedia({video: true, audio: true });
          this.mediaconnect();
          this.start();
          setTimeout(() => {
            this.spinner.hide();
          }, 3000);
        } else {
          this.Routes.navigate(['/error/Room-not-found/' +  this.chat.Roomname]);
        }
      });

    });
   }

   public initializeplayer() {
    this.VideoPlayername = this.currentUser !== null ? 'local' : 'remote';
    this.socket.emit('Call', {
    player:  this.VideoPlayername
    });
   }

async getip() {
  window.RTCPeerConnection = this.getRTCPeerConnection();
  const pc = new RTCPeerConnection({ iceServers: [] });
  pc.createDataChannel('');
  pc.createOffer().then(pc.setLocalDescription.bind(pc));
  pc.onicecandidate = (ice) => {
    this.zone.run(() => {
      if (!ice || !ice.candidate || !ice.candidate.candidate) {
        return;
      }
      if (this.currentUser == null) {
       // tslint:disable-next-line: no-string-literal
       this.name = this.ipRegex.exec(ice.candidate.candidate)[1];
    } else {
      this.name =  this.Currentowner;
    }
      console.log('GetIP entr', this.name);
      pc.onicecandidate = () => {};
      pc.close();
    });
  };
//   await this.service.GetIp().subscribe(res => {
//     if (this.currentUser == null) {
//        // tslint:disable-next-line: no-string-literal
//       this.name = res['ip'];
//     } else {
//       this.name =  this.Currentowner;
//     }
// });
}

private getRTCPeerConnection() {
  return window.RTCPeerConnection ||
    window.mozRTCPeerConnection ||
    window.webkitRTCPeerConnection;
}

openemoji() {
  this.emojiopen = true;
}

addEmoji(e) {
  this.emojiopen = false;
  this.submitmessage.nativeElement.value  += e.emoji.native;
}

async  mediaconnect() {
 // this.right = await navigator.mediaDevices.getUserMedia({video: true, audio: true });
  const Device =  await navigator.mediaDevices.enumerateDevices();
  this.communication =  Device.filter(x => x.kind === 'audioinput');
  this.speakers = Device.filter(x => x.kind === 'audiooutput');
  this.Videoplayer = Device.filter(x => x.kind === 'videoinput');
  }

 public setposter(Poster, vdeo) {
    this.socket.emit('setposter', {
      poster: Poster,
      video: vdeo
    });
  }

async Screenshare() {
   this.stream = await (navigator.mediaDevices as any).getDisplayMedia({video: true, audio: { echoCancellation: false }})
  .then( this.localvideo.nativeElement.srcObject  = this.stream)
  .catch((e) => {
     this.toastr.warning('The browser is having trouble accessing your screen', 'Trouble with screen sharing');
    });
   if (this.stream === undefined) {
    return false;
  }
   if (this.currentUser != null) {
    this.localvideo.nativeElement.srcObject  =  this.stream;
    this.setposter('assets/loader.gif', 'remotevideo');
  } else {
    this.remotevideo.nativeElement.srcObject  =  this.stream;
    this.setposter('assets/loader.gif', 'localvideo');
  }
   this.Liverecords();
   this.app =  setInterval(() => {
    this.Liverecords();
  }, 20000);

   this.stream.getVideoTracks()[0].addEventListener('ended', () => this.ClearSharedata());
}


// ClearSharedata() {
//   const recordRTC = this.recordRTC;
//   clearInterval(this.app);
//   recordRTC.clearRecordedData();
//   return false;
// }

ClearSharedata() {
  const recordRTC = this.recordRTC;
  clearInterval(this.app);
  recordRTC.clearRecordedData();
  this.socket.emit('stopScreen', {
    screen : 'screen'
   });
  this.socket.emit('sharescreen', {
    MediaStream : null
   });
  return false;
}



async Liverecords() {
  const options = {
    mimeType: 'video/mp4', // or video/webm\;codecs=h264 or video/webm\;codecs=vp9
    bitsPerSecond: 128000 // if this line is provided, skip above two
  };
  this.recordRTC = RecordRTC(this.stream, options);
  this.recordRTC.startRecording();
  this.loading = true;
  let url = '';
  setTimeout(() => {
    this.recordRTC.stopRecording();
  }, 6000);

  setTimeout(async () => {
     // tslint:disable-next-line: only-arrow-functions
    await this.recordRTC.getDataURL(function(dataURL) {
      url = dataURL;
    });
  }, 6000);

  setTimeout(async () => {
    this.socket.emit('sharescreen', {
      MediaStream : url
     });
  }, 8000);
}

muteaudio() {
  if (this.currentUser != null) {
    const video: HTMLVideoElement = this.localvideo.nativeElement;
    if (video.muted === false) {
        video.muted = true;
        this.mic = this.micon;
        this.mictext = 'Mic On';
    } else if (video.muted === true) {
      video.muted = false;
      this.mic = this.micoff;
      this.mictext = 'Mic Off';
    }
  } else {
    const video: HTMLVideoElement = this.remotevideo.nativeElement;
    if (video.muted === false) {
        video.muted = true;
        this.mic = this.micon;
        this.mictext = 'Mic On';
    } else if (video.muted === true) {
      video.muted = false;
      this.mic = this.micoff;
      this.mictext = 'Mic Off';
    }
  }
}

videoclose() {
  const video: HTMLVideoElement = this.video.nativeElement;
  video.pause();
}

  async startRecording() {
    // tslint:disable-next-line: max-line-length
    const stream = await (navigator.mediaDevices as any).getDisplayMedia({video: true, audio: { echoCancellation: false }}).then().catch((e) => {
     this.Record = true;
    });
    const options = {
      type: 'video',
      disableLogs: true,
      timeSlice: 1000,
      checkForInactiveTracks: false,
      canvas: {
        width: 640,
        height: 480
    },
      mimeType: 'video/webm', // or video/webm\;codecs=h264 or video/webm\;codecs=vp9
      bitsPerSecond: 128000 // if this line is provided, skip above two
    };

    this.stream = stream;
    this.recordRTC = RecordRTC(stream, options);
    this.recordRTC.startRecording();
    this.stream.getVideoTracks()[0].addEventListener('ended', () => this.stopRecording());
  }

  stopRecording() {
    this.Record = false;
    const recordRTC = this.recordRTC;
    recordRTC.stopRecording(this.processVideo.bind(this));
    const stream = this.stream;
    stream.getAudioTracks().forEach(track => track.stop());
    stream.getVideoTracks().forEach(track => track.stop());
   // this.start();
  }

  VideoPlay() {
    this.Record = true;
    const video: HTMLVideoElement = this.video.nativeElement;
    video.play();
  }

  download() {
    this.name =  this.currentUser !== null ?  this.Currentowner : 'Guest';
    this.recordRTC.save(this.name);
  }

  videoPause() {
    const video: HTMLVideoElement = this.video.nativeElement;
    video.pause();
  }

  async processVideo(audioVideoWebMURL) {
    const video: HTMLVideoElement = this.video.nativeElement;
    const recordRTC = this.recordRTC;
    video.src = audioVideoWebMURL;
    recordRTC.clearRecordedData();
    const recordedBlob = recordRTC.getBlob();
   // tslint:disable-next-line: only-arrow-functions
    await recordRTC.getDataURL(function(dataURL) {
    });
  }

  toggleControls() {
    const video: HTMLVideoElement = this.video.nativeElement;
    video.muted = !video.muted;
    video.controls = !video.controls;
    video.autoplay = !video.autoplay;
  }

  Display() {
    $('#myModal').modal('show');
  }

  GetuserDetial() {
    this.Url = window.location.href.split('//')[1];
    this.currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (this.currentUser != null) {
      this.pics = this.currentUser.photoUrl;
      this.name = this.currentUser.name;
    } else {
      this.name = 'Guest';
    }
  }

  getName(pc) {
    return (pc === this.pc1) ? 'pc1' : 'pc2';
  }

  getOtherPc(pc) {
    return (pc === this.pc1) ? this.pc2 : this.pc1;
  }


  async Calluser(val, player) {
    const options = {
      mimeType: 'video/mp4', // or video/webm\;codecs=h264 or video/webm\;codecs=vp9
      bitsPerSecond: 128000 // if this line is provided, skip above two
    };
    this.recordRTC = RecordRTC(val, options);
    this.recordRTC.startRecording();
    this.loading = true;
    let url = '';
    setTimeout(() => {
      this.recordRTC.stopRecording();
    }, 6000);

    setTimeout(async () => {
       // tslint:disable-next-line: only-arrow-functions
      await this.recordRTC.getDataURL(function(dataURL) {
        url = dataURL;
      });
    }, 6000);

    setTimeout(async () => {
      this.socket.emit('calluser', {
        MediaStream : url,
        Player: player
       });
    }, 8000);
  }

 async gotStream(stream) {
  // if (this.currentUser != null) {
  //  this.Calluser(stream , 'Local');
  //  this.app =  setInterval(() => {
  //     this.Calluser(stream, 'Local');
  //  }, 20000);

  //  this.localvideodata = stream;
  //  this.localvideo.nativeElement.srcObject = stream;
  //  this.localvideo.nativeElement.style.height = '100%';
  //  // this.remotevideo.nativeElement.srcObject = this.remotevideodata.source._value;
  // } else {
  //   this.Calluser(stream, 'Remote');
  //   this.app =  setInterval(() => {
  //     this.Calluser(stream, 'Remote');
  //  }, 20000);
  //   this.remotevideodata = stream;
  //   this.remotevideo.nativeElement.srcObject = stream;
  //   this.remotevideo.nativeElement.style.height = '100%';
  // }
  this.pc1 = new RTCPeerConnection(this.conf);
  this.pc1.onicecandidate = e => {
      this.onIceCandidate(this.pc1, e);
    };
  this.pc2 = new RTCPeerConnection(this.conf);
  this.pc2.onicecandidate = e => {
      this.onIceCandidate(this.pc2, e);
    };

  this.localStream = stream;
  if (this.currentUser != null) {
      this.localvideo.nativeElement.srcObject = stream;
     } else {
      this.remotevideo.nativeElement.srcObject = stream;
      this.call();
     }
  this.videoModal.nativeElement.srcObject =  this.localStream;
  }

    start() {
      navigator.mediaDevices.getUserMedia({
      audio: true,
      video: true
    })
    .then(this.gotStream.bind(this))
    .catch((e) => {
    this.Camon = 'disable';
    this.toastr.info('Try connecting a webcam to join the conversation.', 'We cant detect a camera. Others cant see you.');
    });
  }


  calltest(val) {
    if (val.Stream.pc1 != null) {
          this.localStream.getTracks().forEach(
            track => {
              this.pc2.addTrack(
                track,
                this.localStream
                );
              }
              );
          this.pc2.createOffer(
                this.offerOptions
              ).then(
                this.onCreateOfferSuccessCallTest.bind(this),
                this.onCreateSessionDescriptionError.bind(this)
              );
          this.pc1.ontrack = this.gotlocalStream.bind(this);
      } else {
      this.localStream.getTracks().forEach(
        track => {
          this.pc1.addTrack(
            track,
            this.localStream
            );
          }
          );
      this.pc1.createOffer(
            this.offerOptions
          ).then(
            this.onCreateOfferSuccessCallTestRemote.bind(this),
            this.onCreateSessionDescriptionError.bind(this)
          );
      this.pc2.ontrack = this.gotRemoteStream.bind(this);

    }
}

onCreateOfferSuccessCallTest(desc) {
  this.pc2.setLocalDescription(desc).then(
    () => {
      this.onSetLocalSuccess(this.pc1);
    },
    this.onSetSessionDescriptionError.bind(this)
  );
  this.pc1.setRemoteDescription(desc).then(
    () => {
      this.onSetRemoteSuccess(this.pc2);
    },
    this.onSetSessionDescriptionError.bind(this)
  );
  this.pc1.createAnswer().then(
    this.onCreateAnswerSuccesscallTest.bind(this),
    this.onCreateSessionDescriptionError.bind(this)
  );
}


onCreateOfferSuccessCallTestRemote(desc) {
  this.pc1.setLocalDescription(desc).then(
    () => {
      this.onSetLocalSuccess(this.pc1);
    },
    this.onSetSessionDescriptionError.bind(this)
  );
  this.pc2.setRemoteDescription(desc).then(
    () => {
      this.onSetRemoteSuccess(this.pc2);
    },
    this.onSetSessionDescriptionError.bind(this)
  );
  this.pc2.createAnswer().then(
    this.onCreateAnswerSuccesscallTestRemote.bind(this),
    this.onCreateSessionDescriptionError.bind(this)
  );
}

onCreateAnswerSuccesscallTestRemote(desc) {
  this.pc2.setLocalDescription(desc).then(
    () => {
      this.onSetLocalSuccess(this.pc2);
    },
    this.onSetSessionDescriptionError.bind(this)
  );
  this.trace('pc1 setRemoteDescription start');
  this.pc1.setRemoteDescription(desc).then(
    () => {
      this.onSetRemoteSuccess(this.pc1);
    },
    this.onSetSessionDescriptionError.bind(this)
  );
}

onCreateAnswerSuccesscallTest(desc) {
  this.pc1.setLocalDescription(desc).then(
    () => {
      this.onSetLocalSuccess(this.pc1);
    },
    this.onSetSessionDescriptionError.bind(this)
  );
  this.trace('pc1 setRemoteDescription start');
  this.pc2.setRemoteDescription(desc).then(
    () => {
      this.onSetRemoteSuccess(this.pc2);
    },
    this.onSetSessionDescriptionError.bind(this)
  );
}

  call() {
    this.pc1 = new RTCPeerConnection(this.conf);

    this.pc1.onicecandidate = e => {
      this.onIceCandidate(this.pc1, e);
    };
    this.pc2 = new RTCPeerConnection(this.conf);
    this.pc2.onicecandidate = e => {
      this.onIceCandidate(this.pc2, e);
    };

    this.pc1.oniceconnectionstatechange = e => {
      this.onIceStateChange(this.pc1, e);
    };
    this.pc2.oniceconnectionstatechange = e => {
      this.onIceStateChange(this.pc2, e);
    };

    this.localStream.getTracks().forEach(
      track => {
        this.pc1.addTrack(
          track,
          this.localStream
          );
        }
        );

    this.pc1.createOffer(
      this.offerOptions
    ).then(
      this.onCreateOfferSuccess.bind(this),
      this.onCreateSessionDescriptionError.bind(this)
    );
    this.pc2.ontrack = this.gotlocalStream.bind(this);
  }


  onCreateSessionDescriptionError(error) {
    this.trace('Failed to create session description: ' + error.toString());
  }

  onCreateOfferSuccess(desc) {
    this.pc1.setLocalDescription(desc).then(
      () => {
        // this.socket.emit('streaming', {
        //   pc1 : desc
        // });
     //  this.onSetLocalSuccess(this.pc1);
      },
      this.onSetSessionDescriptionError.bind(this)
    );
    this.pc2.setRemoteDescription(desc).then(
      () => {
        // this.socket.emit('streaming', {
        //   pc2 : desc
        // });
    //    this.onSetRemoteSuccess(this.pc2);
      },
      this.onSetSessionDescriptionError.bind(this)
    );
    this.trace('pc2 createAnswer start');
    // Since the 'remote' side has no media stream we need
    // to pass in the right constraints in order for it to
    // accept the incoming offer of audio and video.
    this.pc2.createAnswer().then(
      this.onCreateAnswerSuccess.bind(this),
      this.onCreateSessionDescriptionError.bind(this)
    );
  }

  onSetLocalSuccess(pc) {
  // this.socket.emit('streaming', this.pc1);
  }

  onSetRemoteSuccess(pc) {
  // this.socket.emit('streaming', this.pc2);
  }

  onSetSessionDescriptionError(error) {
    this.trace('Failed to set session description: ' + error.toString());
  }

   gotRemoteStream(e) {
  if (this.remotevideo.nativeElement.srcObject !== e.streams[0]) {
      this.remotevideo.nativeElement.srcObject = e.streams[0];
      this.trace('pc2 received remote stream');
    }
  }

  gotlocalStream(e) {
    if (this.localvideo.nativeElement.srcObject !== e.streams[0]) {
        this.localvideo.nativeElement.srcObject = e.streams[0];
        this.trace('pc2 received remote stream');
      }
    }

  onCreateAnswerSuccess(desc) {
    this.trace('Answer from pc2:\n' + desc.sdp);
    this.trace('pc2 setLocalDescription start');
    this.pc2.setLocalDescription(desc).then(
      () => {
        this.onSetLocalSuccess(this.pc2);
      },
      this.onSetSessionDescriptionError.bind(this)
    );
    this.trace('pc1 setRemoteDescription start');
    this.pc1.setRemoteDescription(desc).then(
      () => {
        this.onSetRemoteSuccess(this.pc1);
      },
      this.onSetSessionDescriptionError.bind(this)
    );
  }

  onIceCandidate(pc, event) {
    this.getOtherPc(pc).addIceCandidate(event.candidate)
    .then(
      () => {
        this.onAddIceCandidateSuccess(pc);
      },
      (err) => {
        this.onAddIceCandidateError(pc, err);
      }
    );
    this.trace(this.getName(pc) + ' ICE candidate: \n' + (event.candidate ?
        event.candidate.candidate : '(null)'));
  }

  onAddIceCandidateSuccess(pc) {
    this.trace(this.getName(pc) + ' addIceCandidate success');
  }

  onAddIceCandidateError(pc, error) {
    this.trace(this.getName(pc) + ' failed to add ICE Candidate: ' + error.toString());
  }

  onIceStateChange(pc, event) {
    if (pc) {
  //    this.socket.emit('streaming', this.pc);
      console.log(this.getName(pc) + ' ICE state: ' + pc.iceConnectionState);
      console.log('ICE state change event: ', event);
    }
  }

  hangup() {
    this.trace('Ending call');
    this.pc1.close();
    this.pc2.close();
    this.pc1 = null;
    this.pc2 = null;
    this.hangupButtonDisabled = true;
    this.callButtonDisabled = false;
  }

   handleNegotiationNeededEvent() {
    this.pc2.createOffer(
      this.offerOptions
    ).then(
      this.onCreateOfferSuccess.bind(this),
      this.onCreateSessionDescriptionError.bind(this)
    );
  }

  sendToServer(msg) {
    const msgJSON = JSON.stringify(msg);
   // connection.send(msgJSON);
  }
  trace(arg) {
    const now = (window.performance.now() / 1000).toFixed(3);
   // console.log(now + ': ', arg);
  }

  copy(text) {
    text.select();
    document.execCommand('copy');
    text.setSelectionRange(0, 0);
   // this.clipboardService.copyFromContent(text);
    this.toastr.info(text.value, 'Copied');
  }

  openchat() {
    this.chatcount = true;
    const data = document.getElementById('sidebar_secondary');
    data.classList.add('popup-box-on');
    // tslint:disable-next-line: max-line-length
    document.getElementById('chat').style.backgroundImage = 'url(\'assets/Chatbackground.jpg\')';
  }

  closechat() {
    this.chatcount = true;
    this.unreadmsg = false;
    this.usersdata = [];
    const data = document.getElementById('sidebar_secondary');
    data.classList.remove('popup-box-on');
  }

 async Socketjoin() {
  const room = this.route.snapshot.paramMap.get('RoomName');
  await this.socket.emit('join', room);
  }

  scrollBottom() {
    setTimeout(() => (this.content.scrollTop = this.content.scrollHeight), 60);
  }

 async keyDownFunction(e, val) {

    if (e.keyCode === 13) {
      if (this.currentUser == null) {
        this.name = this.name;
        this.pic = 'assets/icon.png';
        // tslint:disable-next-line: no-unused-expression
      } else {
        this.name = this.currentUser.name;
        this.pic = this.currentUser.photoUrl;
      }
      console.log('Eneter function chat', this.name);
      this.now = new Date();
      this.unreadmsg = true;
      this.submitmessage.nativeElement.value = '';
      this.scrollBottom();
      await this.socket.emit('message', {
        sender: this.name,
        msg: val,
        time: this.now,
        pics : this.pic
      });
    }
  }

  public FeedBack() {
  const recordRTC = this.recordRTC;
  const stream = this.localStream;
  if (stream != null) {
    stream.getAudioTracks().forEach(track => track.stop());
    stream.getVideoTracks().forEach(track => track.stop());
  //  clearInterval(this.app);
    this.socket.emit('CloseStream', {
      stream : null
    });
    this.socket.emit('meetingend', {
      name : this.name
    });
  //  recordRTC.clearRecordedData();
  }
  if (this.currentUser != null) {
      this.Routes.navigate(['/user/feedback']);
    } else {
      this.Routes.navigate(['user/leave-room']);
    }
  }

  // Browser close

  @HostListener('window:unload', ['$event'])
     public beforeunloadHandler($event) {

     this.socket.emit('leftstream', {
          stream : null,
          name: this.name
        });
    }

}
