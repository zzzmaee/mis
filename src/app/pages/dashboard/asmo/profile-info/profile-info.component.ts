import { Component, Input } from "@angular/core";
import { NzAvatarModule } from "ng-zorro-antd/avatar";
import { NzFlexModule, NzAlign, NzJustify } from "ng-zorro-antd/flex";

@Component({
  selector: "app-profile-info",
  standalone: true,
  imports: [NzAvatarModule, NzFlexModule],
  templateUrl: "./profile-info.component.html",
  styleUrl: "./profile-info.component.less",
})
export class ProfileInfoComponent {
  @Input() selected: any;
}
