import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {FolderComponent} from './folder/folder.component';
import {StatisticsComponent} from './statistics/statistics.component';
import {DashboardComponent} from './dashboard.component';
import {MatToolbarModule} from '@angular/material/toolbar';
import {MatSidenavModule} from '@angular/material/sidenav';
import {MatGridListModule} from '@angular/material/grid-list';
import {MatCardModule} from '@angular/material/card';
import {MatButtonModule} from '@angular/material/button';
import {MatIconModule} from '@angular/material/icon';
import {MatListModule} from '@angular/material/list';
import {MatDialogModule} from '@angular/material/dialog';
import {MatTooltipModule} from '@angular/material/tooltip';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatDividerModule} from '@angular/material/divider';
import {MarkdownModule} from 'ngx-markdown';
import {MatMenuModule} from '@angular/material/menu';
import {MatInputModule} from '@angular/material/input';
import {HttpClientModule} from '@angular/common/http';
import {MatSelectModule} from '@angular/material/select';
import {MatSlideToggleModule} from '@angular/material/slide-toggle';
import {DashboardRoutingModule} from './dashboard-routing.module';
import {FlexLayoutModule} from '@angular/flex-layout';
import { CategoryDialogComponent } from './category-dialog/category-dialog.component';
import {MatSnackBarModule} from '@angular/material/snack-bar';
import {DeleteCategoryDialogComponent} from './delete-category-dialog/delete-category-dialog.component';
import {CategoryPapersDialogComponent} from './category-papers-dialog/category-papers-dialog.component';
import {MatTableModule} from '@angular/material/table';
import {NgxChartsModule} from '@swimlane/ngx-charts';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {CustomDatepickerModule} from './statistics/custom-datepicker/custom-datepicker.module';

@NgModule({
    declarations: [DashboardComponent, FolderComponent,
        StatisticsComponent, CategoryDialogComponent, DeleteCategoryDialogComponent, CategoryPapersDialogComponent],
    imports: [
        CommonModule,
        DashboardRoutingModule,
        MatToolbarModule,
        MatSidenavModule,
        MatGridListModule,
        MatCardModule,
        MatButtonModule,
        MatIconModule,
        MatListModule,
        MatDialogModule,
        MatTooltipModule,
        FormsModule,
        MatFormFieldModule,
        MatDividerModule,
        MarkdownModule.forRoot(),
        MatMenuModule,
        MatInputModule,
        ReactiveFormsModule,
        HttpClientModule,
        MatSelectModule,
        MatSlideToggleModule,
        FlexLayoutModule,
        MatSnackBarModule,
        MatTableModule,
        NgxChartsModule,
        BrowserAnimationsModule,
        CustomDatepickerModule
    ],
    providers: [
        MatSnackBarModule, MatTableModule
    ]
})
export class DashboardModule { }
