import { Component, inject, OnInit, signal } from '@angular/core';
import { UserDto, CreateUserRequest, UpdateUserRequest } from '../user.model';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { NzModalModule, NzModalRef } from 'ng-zorro-antd/modal';
import { finalize } from 'rxjs/operators';
import { UserService } from '../user.service';
import { NzMessageService } from 'ng-zorro-antd/message';
import { CommonModule } from '@angular/common';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { NzAlertModule } from 'ng-zorro-antd/alert';
import { NzTypographyModule } from 'ng-zorro-antd/typography';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzSpaceModule } from 'ng-zorro-antd/space';
import { NzDescriptionsModule } from 'ng-zorro-antd/descriptions';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { NzSwitchModule } from 'ng-zorro-antd/switch';

// API returns userId as string (201 response)

@Component({
  selector: 'app-user-form',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    NzFormModule,
    NzInputModule,
    NzSelectModule,
    NzSpinModule,
    NzAlertModule,
    NzTypographyModule,
    NzGridModule,
    NzButtonModule,
    NzSpaceModule,
    NzDescriptionsModule,
    NzModalModule,
    TranslatePipe,
    NzIconModule,
    NzSwitchModule
  ],
  templateUrl: './user-form.component.html',
  styleUrl: './user-form.component.less',
})
export class UserFormComponent implements OnInit {
  public editingUser: UserDto | null;
  public readonly isSaving = signal(false);
  public readonly createdUserId = signal<string | null>(null);
  public userForm: FormGroup;
  public roleOptions: { label: string; value: string }[] = [];

  private readonly _userService = inject(UserService);
  private readonly _fb = inject(FormBuilder);
  private readonly _message = inject(NzMessageService);
  private readonly _modalRef = inject(NzModalRef);
  private readonly _translate = inject(TranslateService);

  constructor() {
    const modalData = this._modalRef.getConfig().nzData;
    this.editingUser = modalData.editingUser;

    this.userForm = this._fb.group({
      username: ['', [Validators.required, Validators.minLength(3)]],
      firstName: [''],
      lastName: [''],
      email: ['', [Validators.email]],
      enabled: [true],
      emailVerified: [false],
      roles: [[]],
      // Remove facility_ids and roleSet as they're not in API
    });

    // Role options should be loaded from API or config
    // For now, using empty array - should be populated from actual roles endpoint
    this.roleOptions = [];
  }

  public get emailControl(): AbstractControl {
    return this.userForm.controls['email'];
  }

  public ngOnInit(): void {
    if (this.editingUser) {
      // Load full user data including roles
      this._userService.getUserById(this.editingUser.id).subscribe({
        next: (user) => {
          this.userForm.patchValue({
            username: user.username,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            enabled: user.enabled,
            emailVerified: user.emailVerified,
            roles: user.attributes?.['roles'] || [],
          });
        },
        error: (err) => {
          this._message.error(this._translate.instant('USERS.LOAD_USER_ERROR', { message: err.message }));
          // Fallback to editingUser data
          this.userForm.patchValue({
            username: this.editingUser!.username,
            firstName: this.editingUser!.firstName,
            lastName: this.editingUser!.lastName,
            email: this.editingUser!.email,
            enabled: this.editingUser!.enabled,
            emailVerified: this.editingUser!.emailVerified,
            roles: this.editingUser!.attributes?.['roles'] || [],
          });
        },
      });
    }

    // TODO: Load available roles from API or config
    // For now, using empty array - should be populated from roles endpoint
    this.roleOptions = [];
  }

  public saveUser(): void {
    if (!this.userForm.valid) {
      Object.values(this.userForm.controls).forEach((control) => {
        control.markAsDirty();
        control.updateValueAndValidity({ onlySelf: true });
      });
      return;
    }

    this.isSaving.set(true);
    const formValue = this.userForm.value;

    if (this.editingUser) {
      // Update user
      const updateRequest: UpdateUserRequest = {
        email: formValue.email,
        firstName: formValue.firstName,
        lastName: formValue.lastName,
        enabled: formValue.enabled,
        emailVerified: formValue.emailVerified,
        roles: formValue.roles,
      };

      this._userService
        .updateUser(this.editingUser.id, updateRequest)
        .pipe(finalize(() => this.isSaving.set(false)))
        .subscribe({
          next: () => {
            this._message.success(this._translate.instant('USERS.SAVE.SUCCESS'));
            this._modalRef.close(true);
          },
          error: (err) => {
            this._message.error(this._translate.instant('USERS.SAVE.ERROR', { message: err.message }));
          },
        });
    } else {
      // Create user
      const createRequest: CreateUserRequest = {
        username: formValue.username,
        email: formValue.email,
        firstName: formValue.firstName,
        lastName: formValue.lastName,
        enabled: formValue.enabled ?? true,
        emailVerified: formValue.emailVerified ?? false,
        roles: formValue.roles,
        // Note: API doesn't require password in CreateUserRequest
        // Password reset should be sent separately after creation
      };

      this._userService
        .createUser(createRequest)
        .pipe(finalize(() => this.isSaving.set(false)))
        .subscribe({
          next: (userId: string) => {
            this.createdUserId.set(userId);
            this._message.success(this._translate.instant('USERS.CREATE.SUCCESS'));
            // Optionally trigger password reset email
            this._userService.resetPassword(userId).subscribe({
              next: () => {
                this._message.info(this._translate.instant('USERS.RESET_PASSWORD_INFO'));
              },
              error: () => {
                // Silent fail - user created but password reset failed
              },
            });
          },
          error: (err) => {
            this._message.error(this._translate.instant('USERS.CREATE.ERROR', { message: err.message }));
          },
        });
    }
  }

  public closeModal(): void {
    const wasSuccessful = !!this.createdUserId();
    this._modalRef.close(wasSuccessful);
  }
}
