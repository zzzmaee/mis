import {Component, inject, OnInit, signal} from '@angular/core';
import {TranslatePipe} from '@ngx-translate/core';
import {NzButtonComponent, NzButtonModule} from 'ng-zorro-antd/button';
import {NzIconDirective, NzIconModule} from 'ng-zorro-antd/icon';
import {NzTableComponent, NzTableModule} from 'ng-zorro-antd/table';
import {NzAvatarComponent, NzAvatarModule} from 'ng-zorro-antd/avatar';
import {NzInputDirective, NzInputModule } from 'ng-zorro-antd/input';
import {FormBuilder, FormGroup, ReactiveFormsModule} from '@angular/forms';
import {
  NzFormControlComponent,
  NzFormDirective,
  NzFormItemComponent,
  NzFormLabelComponent,
  NzFormModule
} from 'ng-zorro-antd/form';
import {NzCardComponent, NzCardModule} from 'ng-zorro-antd/card';

@Component({
  selector: 'app-arm',
  imports: [
    TranslatePipe,
    NzButtonModule,
    NzIconModule,
    NzTableModule,
    NzAvatarModule,
    ReactiveFormsModule,
    NzFormModule,
    NzInputModule,
    NzCardModule
  ],
  templateUrl: './arm.component.html',
  styleUrl: './arm.component.less'
})
export class ARMComponent implements OnInit {
  public readonly isLoading = signal(true);
  public readonly arms = signal<any[]>([]);

  public filterForm: FormGroup;

  private fb = inject(FormBuilder);

  constructor() {
    this.filterForm = this.fb.group({
      cardName: [null]
    })
  }

  public ngOnInit(): void {
    this.loadArms();
  }

  protected clearField(fieldName: string): void {
    const control = this.filterForm.get(fieldName);
    if (control) {
      control.setValue(null);
    }
  }

  public loadArms(): void {
    this.isLoading.set(false);
    this.arms.set([
      {
        avatar: "assets/images/avatars/petr.png",
        username: "Петр свидлер",
        gender: "Мужчина",
        years: 35,
        pressure: {
          systolic: 120,
          diastolic: 80,
          high: false
        },
        cholesterol: {
          value: 9,
          high: false
        },
        ketone: {
          value: 1,
          high: true
        },
        weight: {
          value: 78,
          high: false
        },
        oxygen: {
          percent: 100,
          pulse: 80,
          normal: true
        },
        temperature: {
          value: 36,
          normal: true
        },
      },
      {
        avatar: "assets/images/avatars/petr.png",
        username: "Петр свидлер",
        gender: "Мужчина",
        years: 35,
        pressure: {
          systolic: 120,
          diastolic: 80,
          high: true
        },
        cholesterol: {
          value: 9,
          high: true
        },
        ketone: {
          value: 1,
          high: false
        },
        weight: {
          value: 78,
          high: true
        },
        oxygen: {
          percent: 100,
          pulse: 80,
          normal: true
        },
        temperature: {
          value: 36,
          normal: true
        },
      },
    ])
  }
}
