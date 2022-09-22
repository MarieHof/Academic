import { EditorUrlParamsService } from './editor.service';
import { MatDialog } from '@angular/material/dialog';
import {AfterViewChecked, Component, ElementRef, HostListener, OnDestroy, OnInit, ViewChild} from '@angular/core';

import { MarkdownService } from 'ngx-markdown';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';
import { PaperTitleDialogComponent } from './components/paper-title-dialog/paper-title-dialog.component';
import { MatSnackBar } from '@angular/material/snack-bar';

import {  CKEditorComponent } from '@ckeditor/ckeditor5-angular/ckeditor.component';
import { HighlightcomponentService } from '../layout/services/highlightcomponent.service';




// const Context = ClassicEditor.Context;
// const ContextWatchdog = ClassicEditor.ContextWatchdog;

@Component({
  selector: 'app-editor',
  templateUrl: './editor.component.html',
  styleUrls: ['./editor.component.scss']
})
export class EditorComponent implements OnInit, OnDestroy {
  public wordsCount = 0;
  public wordList: string[];
  public paper: any;
  public averageSentenceLength = 0;
  public selectedCategory: string;
  categoryId: number;
  id: number;
  searchTerm:string;
  show= false;

  // public Editor = ClassicEditor;
  @ViewChild( 'myEditor' ) editorComponent: CKEditorComponent;
  editorData = '';
  startTypingTime: Date;
  endTypingTime: Date;
  duration = 0;
  textBeforeSearch: string;
  timeouts = [];

  constructor(public dialog: MatDialog,
    private markdownService: MarkdownService,
    private readonly http: HttpClient,
    private router: Router,
    private route: ActivatedRoute,

    private snackBar: MatSnackBar,private elementRef: ElementRef,
    public urlParamService: EditorUrlParamsService,
    private highlightService: HighlightcomponentService) {

  }

  public ngOnInit(): void {
    this.categoryId = +this.route.snapshot.paramMap.get('category_id');
    console.log('editor oninit this.categoryId ', this.categoryId);

    this.id = +this.route.snapshot.paramMap.get('id');
    console.log('editor oninit this.paperId ', this.id);

    if (this.id) { //here wer're editing the paper
      this.getPaper();
    }
    else {
      this.urlParamService.changeParam({
        category_id: this.categoryId,
        paper: null
      })
    }

    const changes = this.urlParamService.getChanges().subscribe(updatedPaper => {
      console.log('ngoninit editor, before if updatedpaper');
      if (updatedPaper.paper && updatedPaper.category_id) {
        this.categoryId = updatedPaper.category_id;
        this.paper = updatedPaper.paper;
      }
    });


    // const contextConfig = {};
    // this.watchdog = new ContextWatchdog(Context);
    // this.watchdog.create(contextConfig)
    //   .then(() => {
    //     this.ready = true;
    //   });
  }

  public onReady({editor}){
    let self = this;
    editor.document.on('keyup',function($event){
      self.keyupEditor($event);
    });

  }


  public highlight() {
    if (!this.searchTerm) {
        this.editorData = this.textBeforeSearch;
    }
    else{
      this.textBeforeSearch = this.editorData;
      this.editorData = this.editorData.replace(new RegExp(this.searchTerm, "gi"), match => {
        return '<strong><i><span class="marker">' + match + '</span></i></strong>';
      });
    }
  }

  handleSearch(): void{
    // if (!this.searchTerm) {
      this.editorData = this.textBeforeSearch;
    // }
  }

  get_text_statistics(){
    if(this.editorData && this.editorData.length){
      let without_html = this.editorData.replace(/<(?:.|\n)*?>/gm, ' ');
      // console.log(without_html);
      let without_unuseful_chars = without_html.replace(/(?:\r\n|\r|\n|\t)/g, '');
      // console.log(without_unuseful_chars);
      let without_line_code = without_unuseful_chars.replace(/&nbsp;/g, '');
      console.log(without_line_code.trim().split(' ').filter(x=> x!=='' ));
      this.wordsCount = without_line_code.trim().split(' ').filter(x=> x!=='' ).length;
      let lines = without_html.split('\n');
      // console.log(lines);
      let lines_without_unused_chars = lines.map(x => x.replace(/(?:\r\n|\r|\n|\t)/g, '').replace(/&nbsp;/g, '').trim()).filter(x => x!=='');
      let sentences = [];
      // let sentences_length = 0;
      lines_without_unused_chars.forEach(x => (x.split(/[.?!]/).forEach( y => {if(y!=='') sentences.push(y); })));
      // console.log(sentences);
      if(sentences && sentences.length){
        this.averageSentenceLength = this.wordsCount / sentences.length;
      }
    }
  }

  public onChange({ editor }: any) {
    this.editorData = editor.getData();

    this.get_text_statistics();
    if (!this.startTypingTime){
      this.startTypingTime = new Date();
    }
    if (this.timeouts && this.timeouts.length){
      for (let i = 0 ; i < this.timeouts.length; i++) {
        clearTimeout(this.timeouts[i]);
      }
      this.timeouts = [];
    }
    // this.updatePaper(data);
  }
  // tslint:disable-next-line:typedef
  public keyupEditor(event){
    if (this.timeouts && this.timeouts.length){
      for (let i = 0 ; i < this.timeouts.length; i++) {
        clearTimeout(this.timeouts[i]);
      }
      this.timeouts = [];
    }
      // timer every 1 minute
    this.timeouts.push(setTimeout(() => {
        console.log('timer for duration');

        if (this.startTypingTime) {
          this.endTypingTime = new Date();
          const hours = Math.abs(this.endTypingTime.getTime() - this.startTypingTime.getTime()) / 3600000;

          this.duration = this.duration + hours;
          this.startTypingTime = null;
        }
      }, 60000));
    // timer every xOfmin minutes
    let xOfmin = 1
    this.timeouts.push(setTimeout(() => {
        console.log('timer for stop writing');
        this.snackBar.open("Hey I have noticed that you haven’t been active for over " + xOfmin + " minutes. Maybe you need a break, you should go for a walk or take some time to relax.  ", 'Close' , {
          duration: 10000,
        });
      }, xOfmin *60000));
  }

  public goDashboard(): void {
    this.router.navigate(['dashboard']);
  }

  public getPaper(): void {
    console.log('inside getpaper:')
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        Authorization: `${localStorage.getItem('access_token')}`,
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': 'true',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'GET,PUT,POST,DELETE',
      })
    };
    this.http.get(`http://127.0.0.1:5000/api/paper?id=${this.id}`, httpOptions)
      .subscribe((response: any) => {
        this.paper = response;

        if (this.paper) {
          this.editorData = this.paper.content;
          this.get_text_statistics();
          this.textBeforeSearch = this.paper.content;
          this.urlParamService.changeParam({
            category_id: this.categoryId,
            paper: this.paper
          });
        }
      });
  }

  public savePaper(): void {
   // this.focusText = false;
    const dialogRef = this.dialog.open(PaperTitleDialogComponent, {
      width: '350px',
      data: this.paper ? { id: this.paper.id, title: this.paper.title } : {}
    });


    dialogRef.afterClosed().subscribe(result => {
      if (result && result !== '') {
        if (this.paper) {
          this.paper.title = result;
          this.updatePaper(this.editorData);
         // this.focusText = true;
        } else {
          this.paper = {};
          this.paper.title = result;
          this.addPaper(this.editorData);
         // this.focusText = true;
        }
      }
    });
  }

  public addPaper(data: string): void {
    const body = {
      content:  data,
      title: this.paper.title,
      last_modified: new Date(),
      author_id: localStorage.getItem('user_id'),
      category_id: this.categoryId
    };
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        Authorization: `${localStorage.getItem('access_token')}`,
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': 'true',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'GET,PUT,POST,DELETE',
      })
    };
    this.http.post(`http://127.0.0.1:5000/api/paper`, body, httpOptions)
      .subscribe(response => {
        this.paper = response;
        this.urlParamService.changeParam({
          category_id: this.categoryId,
          paper: this.paper
        });
        console.log('in save paper after post call ', response)
        this.snackBar.open('Paper has been added successfully', 'Close', {
          duration: 6000
        });
      });
  }


  public updatePaper(data: string): void {
    const updatedPaper = {
      content: data,
      title: this.paper.title,
      last_modified: new Date(),
      id: this.paper.id,
      author_id: localStorage.getItem('user_id'),
      category_id: this.categoryId
    };

    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        Authorization: `${localStorage.getItem('access_token')}`,
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': 'true',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'GET,PUT,POST,DELETE',
      })
    };

    this.http.put(`http://127.0.0.1:5000/api/paper?id=${this.paper.id}`, updatedPaper, httpOptions)
      .subscribe(response => {
        this.paper = response;
        this.urlParamService.changeParam({
          category_id: this.categoryId,
          paper: this.paper
        })
        // this.snackBar.open('paper saved successfully', 'Close', {
        //   duration: 6000
        // });
      });
  }
  @HostListener('window:unload', [ '$event' ])
  unloadHandler(event) {
    this.handelLeaveEditor();
  }
  ngOnDestroy(): void {
    this.handelLeaveEditor();
  }

  handelLeaveEditor(): void{
    if (this.paper && this.paper.id){
      if (!this.duration){
        if (this.startTypingTime) {
          this.endTypingTime = new Date();
          const hours = Math.abs(this.endTypingTime.getTime() - this.startTypingTime.getTime()) / 3600000;

          this.duration = this.duration + hours;
          this.startTypingTime = null;
        }
      }
      const body = {
        duration_time:  this.duration,
        paper_id: this.paper.id
      };
      const httpOptions = {
        headers: new HttpHeaders({
          'Content-Type': 'application/json',
          Authorization: `${localStorage.getItem('access_token')}`,
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Credentials': 'true',
          'Access-Control-Allow-Headers': 'Content-Type',
          'Access-Control-Allow-Methods': 'GET,PUT,POST,DELETE',
        })
      };
      this.http.post(`http://127.0.0.1:5000/api/duration`, body, httpOptions)
        .subscribe(response => {});
    }

  }

  ngAfterViewInit(): void {
    this.highlightService.getChanges().subscribe(componentName => {
      if (componentName.text == 'editor') {
        this.show = true;
        setTimeout(()=>{
          this.show = false;
        },2000)
      }
    });
  }
}





