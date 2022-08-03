import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'UpdateRows',

})
export class UpdateRowsPipe implements PipeTransform {

  transform<T>(value: T[], perRow: number): T[][] {
    let updated_db_result: T[][] = [];
    for (let i = 0; i < value.length; i += perRow) {
      updated_db_result.push(value.slice(i, i + perRow))
    }
    return updated_db_result;
  }

}