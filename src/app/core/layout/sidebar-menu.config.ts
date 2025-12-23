import {Injectable} from '@angular/core';

export enum Role {
  SUPERADMIN = 'SUPERADMIN',
  ADMIN = 'ADMIN',
  INSPECTOR = 'INSPECTOR',
  USER = 'USER',
}

export interface SidebarMenuItem {
  path?: string;
  titleKey: string;
  icon?: string;
  children?: SidebarMenuItem[];
  requiredRole?: Role[] | null;
}

@Injectable({
  providedIn: 'root',
})
export class SidebarMenuConfig {
  public readonly menuItems: SidebarMenuItem[] = [
    {
      titleKey: 'SIDEBAR.MENU.MEDICAL_DATA',
      icon: 'nz:circles-four',
      children: [
        {
          path: 'patient-visit',
          titleKey: 'SIDEBAR.MENU.PATIENT_VISIT',
        },
      ]
    },
    {
      path: 'reports',
      titleKey: 'SIDEBAR.MENU.REPORTS',
      icon: 'nz:file-text',
    },
    {
      path: 'users',
      titleKey: 'SIDEBAR.MENU.USERS',
      icon: 'nz:user-list',
    },
  ];
}
