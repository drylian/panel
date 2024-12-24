import { Entity, PrimaryGeneratedColumn, Column, BaseEntity, CreateDateColumn, UpdateDateColumn, ManyToOne, BeforeInsert } from "typeorm";
import Users from "./users";
import { randomUUID } from "crypto";

export type KeyofCliToken = keyof InstanceType<typeof ClientToken>;

/**
 * Entidade de ClientToken.
 * @class ClientToken
 * @extends BaseEntity
 */
@Entity("ClientToken")
export default class ClientToken extends BaseEntity {
    /**
     * ID of token.
     */
    @PrimaryGeneratedColumn()
    id!: number;

    /**
     * Memo of token
     */
    @Column({ type:"text", nullable: false })
    memo!:string;

    /**
     * Token
     */
    @Column({ nullable: false })
    token!: string;

    /**
     * UUID of token
     */
    @Column({ type: 'uuid', unique: true })
    uuid!: string;

    /**
     * Permissions of user
     */
    @Column({ type: "simple-array", nullable: false, default: JSON.stringify([])})
    permissions!: string[];

    /**
     * User who created the token
     */
    @ManyToOne(() => Users, user => user.cli_tokens, { nullable: false })
    user?: ReturnType<typeof Users.public>[0];

    /**
     * last use of token, 
     */
    @Column({  nullable: true })
    last_use?: Date;

    /**
     * Creation date of token.
     */
    @CreateDateColumn()
    create_at!: Date;


    @BeforeInsert()
    generateUUID() {
        this.uuid = randomUUID();
    }
    
    /**
     * Allowed Searchable Fields
     */
    public static readonly searchable: (keyof typeof this.prototype)[] = [
        "id",
        "token",
        "token",
        "memo",
        "uuid",
        "last_use",
        "create_at",
    ];

    /**
     * Allowed another tables includes in this model
     */
    public static readonly includes: (keyof typeof this.prototype)[] = [];

    /**
     * Filter only public informations 
     */
    public static public(...datables: typeof this.prototype[]) {
        return datables.map((data: Partial<typeof this.prototype>) => {
            if(data.user) {
                data.user = Users.public(data.user as Users)[0];
            }
        })
    }
}

