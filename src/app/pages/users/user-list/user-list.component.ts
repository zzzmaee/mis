import { Component, inject, OnInit, signal } from '@angular/core';
import { UserService } from '../user.service';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalModule, NzModalService } from 'ng-zorro-antd/modal';
import { UserDto, PageResponse, GetUsersParams } from '../user.model';
import { finalize } from 'rxjs/operators';
import { UserFormComponent } from '../user-form/user-form.component';
import { CommonModule } from '@angular/common';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzPopconfirmModule } from 'ng-zorro-antd/popconfirm';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzTypographyModule } from 'ng-zorro-antd/typography';
import { NzSpaceModule } from 'ng-zorro-antd/space';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { BulkOperationRequest } from '../user.model';

@Component({
  selector: 'app-user-list',
  imports: [
    CommonModule,
    NzTableModule,
    NzButtonModule,
    NzIconModule,
    NzPopconfirmModule,
    NzSpinModule,
    NzTagModule,
    NzTypographyModule,
    NzSpaceModule,
    NzModalModule,
    TranslatePipe,
    NzDividerModule,
  ],
  templateUrl: './user-list.component.html',
  styleUrl: './user-list.component.less',
})
export class UserListComponent implements OnInit {
  public readonly isLoading = signal(true);
  public readonly users = signal<UserDto[]>([]);
  public readonly total = signal(0);
  public readonly pageIndex = signal(1);
  public readonly pageSize = signal(20);

  private readonly _userService = inject(UserService);
  private readonly _message = inject(NzMessageService);
  private readonly _modalService = inject(NzModalService);
  private readonly _translate: TranslateService = inject(TranslateService);

  public ngOnInit(): void {
    this.loadUsers();
  }

  public loadUsers(params?: GetUsersParams): void {
    this.isLoading.set(true);
    const queryParams: GetUsersParams = {
      page: (params?.page ?? this.pageIndex()) - 1, // API uses 0-indexed pages
      size: params?.size ?? this.pageSize(),
      ...params,
    };

    this._userService
      .getUsers(queryParams)
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe({
        next: (data: PageResponse<UserDto>) => {
          this.users.set(data.content);
          this.total.set(data.total);
          this.pageIndex.set(data.page + 1); // Convert back to 1-indexed for UI
        },
        error: (err) => this._message.error(this._translate.instant('USERS.LOAD_ERROR', { message: err.message })),
      });
  }

  public onPageIndexChange(page: number): void {
    this.pageIndex.set(page);
    this.loadUsers({ page: page - 1 });
  }

  public onPageSizeChange(size: number): void {
    this.pageSize.set(size);
    this.pageIndex.set(1);
    this.loadUsers({ page: 0, size });
  }

  public openUserModal(userToEdit?: UserDto): void {
    const modalRef = this._modalService.create({
      nzWidth: 480,
      nzTitle: userToEdit ? this._translate.instant('USERS.EDIT_USER') : this._translate.instant('USERS.ADD_USER'),
      nzContent: UserFormComponent,
      nzData: {
        editingUser: userToEdit,
      },
      nzMaskClosable: false,
      nzFooter: null,
    });

    modalRef.afterClose.subscribe((wasSuccessful: boolean) => {
      if (wasSuccessful) {
        this.loadUsers({ page: this.pageIndex() - 1, size: this.pageSize() });
      }
    });
  }

  public showDeleteConfirm(user: UserDto): void {
    this._modalService.create({
      nzWidth: 520,
      nzTitle: this._translate.instant('USERS.DELETE.CONFIRM_TITLE'),
      nzContent: this._translate.instant('USERS.DELETE.CONFIRM_CONTENT', { username: user.username }),
      nzOkText: this._translate.instant('USERS.DELETE.OK_TEXT'),
      nzOkType: 'primary',
      nzOkDanger: true,
      nzOnOk: () => this.confirmDelete(user.id),
      nzCancelText: this._translate.instant('USERS.DELETE.CANCEL_TEXT'),
      nzBodyStyle: { textAlign: 'center', textWrap: 'balance' },
    });
  }

  public confirmDelete(userId: string): void {
    const request: BulkOperationRequest = { userIds: [userId] };
    this._userService.bulkDeleteUsers(request).subscribe({
      next: (response) => {
        if (response.failureCount === 0) {
          this._message.success(this._translate.instant('USERS.DELETE.SUCCESS'));
          this.loadUsers();
        } else {
          this._message.error(this._translate.instant('USERS.DELETE.ERROR', { message: response.errors[0]?.message }));
        }
      },
      error: (err) => this._message.error(this._translate.instant('USERS.DELETE.ERROR', { message: err.message })),
    });
  }

  public showResetPasswordConfirm(user: UserDto): void {
    this._modalService.create({
      nzWidth: 520,
      nzTitle: this._translate.instant('USERS.RESET_PASSWORD.CONFIRM_TITLE'),
      nzContent: this._translate.instant('USERS.RESET_PASSWORD.CONFIRM_CONTENT', { username: user.username }),
      nzOkText: this._translate.instant('USERS.RESET_PASSWORD.OK_TEXT'),
      nzOkType: 'primary',
      nzOkDanger: true,
      nzOnOk: () => this._handlePasswordReset(user.id),
      nzCancelText: this._translate.instant('USERS.RESET_PASSWORD.CANCEL_TEXT'),
      nzBodyStyle: { textAlign: 'center', textWrap: 'balance' },
    });
  }

  private _handlePasswordReset(userId: string): void {
    this._userService.resetPassword(userId).subscribe({
      next: () => {
        this._message.success(this._translate.instant('USERS.RESET_PASSWORD.SUCCESS'));
      },
      error: (err) => {
        this._message.error(this._translate.instant('USERS.RESET_PASSWORD.ERROR', { message: err.message }));
      },
    });
  }

  public blockUser(user: UserDto): void {
    this._userService.blockUser(user.id).subscribe({
      next: () => {
        this._message.success(this._translate.instant('USERS.BLOCK.SUCCESS'));
        this.loadUsers();
      },
      error: (err) => this._message.error(this._translate.instant('USERS.BLOCK.ERROR', { message: err.message })),
    });
  }

  public unblockUser(user: UserDto): void {
    this._userService.unblockUser(user.id).subscribe({
      next: () => {
        this._message.success(this._translate.instant('USERS.UNBLOCK.SUCCESS'));
        this.loadUsers();
      },
      error: (err) => this._message.error(this._translate.instant('USERS.UNBLOCK.ERROR', { message: err.message })),
    });
  }
}
