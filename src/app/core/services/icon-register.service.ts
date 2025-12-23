import { inject, Injectable } from '@angular/core';
import { NzIconService } from 'ng-zorro-antd/icon';
import {svgIcons} from '../custom-icons/custom-icons.component';

@Injectable({
  providedIn: 'root',
})
export class IconRegisterService {
  private readonly _nzIconService: NzIconService = inject(NzIconService);

  public registerIcons(): void {
    svgIcons.forEach((icon): void => {
      this._nzIconService.addIconLiteral(icon.namespace, icon.literal);
    });
  }
}
