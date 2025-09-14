import ScopeNameDTO from "./ScopeNameDTO";
import { Expose, Type } from "class-transformer";
import { IsDefined, IsString, MaxLength, MinLength } from "class-validator";

export default class InquiryEndpointDTO extends ScopeNameDTO {
    @Expose()
    @Type(() => String)
    @IsDefined()
    @IsString()
    @MinLength(50)
    @MaxLength(500)
    url!: string;
}