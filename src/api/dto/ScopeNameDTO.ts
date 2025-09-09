import { Expose, Type } from "class-transformer";
import { IsDefined, IsNumber, Max, Min } from "class-validator";

export default class ScopeNameDTO {
    @Expose()
    @Type(() => Number)
    @IsDefined()
    @IsNumber()
    @Min(0)
    @Max(10e6)
    /** Scope unique name */
    scope!: string;
}