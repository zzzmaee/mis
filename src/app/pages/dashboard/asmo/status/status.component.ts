import { Component, Input } from "@angular/core";
import { CommonModule } from "@angular/common";
import { TranslatePipe } from "@ngx-translate/core";

@Component({
  selector: "app-status",
  standalone: true,
  imports: [CommonModule, TranslatePipe],
  templateUrl: "./status.component.html",
  styleUrl: "./status.component.less",
})
export class StatusComponent {
  @Input() status: string | undefined = "success";
}
