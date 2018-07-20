'use strict';
let Content = Vue.extend({
    props: ["value"],
    methods: {
        askFlood() {
            if (this.$el.scrollWidth > this.$el.clientWidth+1) return true;
            if (this.$el.scrollHeight > this.$el.clientHeight+1) return true;
            return false;
        }
    },
    watch: {
        value() {
            setTimeout(()=>{
                this.$emit("flood", this.askFlood());
            });
        }
    },
    created() {
        setTimeout(()=>{
            this.$emit("flood", this.askFlood());
        });
    }
});

let SimpleText = Content.extend({
    template: `
    <p class="content">{{value}}</p>
    `
})

let RubyText = Content.extend({
    template: `
    <p class="content with-ruby">
        <template v-for="item in rubies">
            <template v-if="item">
                <ruby v-if="item.ruby">
                    {{item.text}}
                    <rt>{{item.ruby}}</rt>
                </ruby>
                <template v-else>
                    {{item.text}}
                </template>
            </template>
            <br v-else/>
        </template>
    </p>
    `,
    computed: {
        rubies() {
            let lines = this.value[0].split("\n");
            let ruby = this.value[1].split(" ");
            let arr = new Array();
            let i=0;
            for (let j=0; j<lines.length; ++j) {
                if (j > 0) {
                    arr.push(false);
                }
                let text = lines[j].split(" ");
                for (let k=0; k<text.length; ++k, ++i) {
                    arr.push({
                        text: text[k],
                        ruby: ruby[i]
                    });
                }
            }
            return arr;
        }
    }
});

let Writing = Content.extend({
    template: `
    <div class="content writing">
        <p v-for="para in paragraphs" class="paragraph">{{para}}</p>
    </div>
    `,
    computed: {
        paragraphs() {
            return this.value.trim().split("\n").map(s => s.trim());
        }
    }
});

let Building = Vue.extend({
    props: ["data"],
    data() {
        return { flooding: {} }
    },
    methods: {
        onFlood(name, b) {
            Vue.set(this.flooding, name, b);
        }
    }
});


let BasicsBuilding = Building.extend({
    components: { RubyText, SimpleText, },
    template: `
    <article id="basics" class="building">
    <div class="floor">
        <section id="name" class="room info" :class="{ flood: flooding.name }">
            <h1>氏名</h1>
            <ruby-text :value="data.name" @flood="onFlood('name', $event)">
            </ruby-text>
        </section>
    </div>
    <div class="floor">
        <section id="birthday" class="room info" :class="{ flood: flooding.birthday }">
            <h1>生年月日</h1>
            <simple-text :value="birthdayText" @flood="onFlood('birthday', $event)">
            </simple-text>
        </section>
        <section id="sex" class="room info" :class="{ flood: flooding.sex }">
            <h1>性別</h1>
            <simple-text :value="data.sex" @flood="onFlood('sex', $event)"></simple-text>
        </section>
    </div>
    </article>
    `,
    computed: {
        birthdayText() {
            let d = this.data.birthday;
            let age = this.age;
            return `${d[0]}年${d[1]}月${d[2]}日 (満${age}歳)`;
        },
        age() {
            if (this.data.today[1] > this.data.birthday[1]
            || (this.data.today[1] == this.data.birthday[1]
                && this.data.today[2] >= this.data.birthday[2])) {
                return this.data.today[0] - this.data.birthday[0];
            }
            return this.data.today[0] - this.data.birthday[0] - 1;
        }
    }
});

let ContactBuilding = Building.extend({
    components: { SimpleText, RubyText },
    template: `
    <article id="contact" class="building">
    <div class="floor">
        <section id="address-with-post" class="room info" :class="{ flood: flooding.post || flooding.address }">
            <h1>現住所</h1>
            <div>
                <simple-text id="post" :value="postText" @flood="onFlood('post', $event)"></simple-text>
                <ruby-text id="address" :value="data.address" @flood="onFlood('address', $event)"></ruby-text>
            </div>
        </section>
    </div>
    <div class="floor">
        <section id="telephone" class="room info" :class="{ flood: flooding.telephone }">
            <h1>電話</h1>
            <simple-text v-if="data.telephone"
                class="phone" :value="data.telephone"
                @flood="onFlood('telephone', $event)">
            </simple-text>
            <p v-else>なし</p>
        </section>
        <section id="cellphone" class="room info" :class="{ flood: flooding.cellphone }">
            <h1>携帯</h1>
            <simple-text v-if="data.cellphone"
                class="phone" :value="data.cellphone"
                @flood="onFlood('cellphone', $event)">
            </simple-text>
            <p v-else>なし</p>
        </section>
    </div>
    <div class="floor">
        <section id="mail" class="room info" :class="{ flood: flooding.mail }">
            <h1>E-mail</h1>
            <simple-text v-if="data.mail"
                class="mail" :value="data.mail"
                @flood="onFlood('mail', $event)">
            </simple-text>
            <p v-else>なし</p>
        </section>
    </div>
    <div class="floor">
        <section id="alt-address" class="room info" :class="{ flood: flooding['alt-address'] }">
            <h1>連絡先</h1>
            <simple-text v-if="data.altAddress"
                :value="data.altAddress"
                @flood="onFlood('alt-address', $event)">
            </simple-text>
            <p v-else>なし</p>
        </section>
    </div>
    <div class="floor">
        <section id="alt-phone" class="room info" :class="{ flood: flooding['alt-phone'] }">
            <h1>電話</h1>
            <simple-text v-if="data.altPhone"
                :value="data.altPhone"
                @flood="onFlood('alt-phone', $event)">
            </simple-text>
            <p v-else>なし</p>
        </section>
    </div>
    </article>
    `,
    computed: {
        postText() {
            return `〒${this.data.post}`;
        }
    }
});

let PromotionBuilding = Building.extend({
    components: { Writing },
    props: ["data"],
    template: `
    <article id="promotions" class="building">
    <div class="floor">
        <section id="motivation" class="room promotion" :class="{ flood: flooding.motivation }">
            <h1>志望動機</h1>
            <writing :value="data.motivation" @flood="onFlood('motivation', $event)"></writing>
        </section>
    </div>
    <div class="floor">
        <section id="study" class="room promotion" :class="{ flood: flooding.study }">
            <h1>得意科目及び研究課題</h1>
            <writing :value="data.study" @flood="onFlood('study', $event)"></writing>
        </section>
    </div>
    <div class="floor">
        <section id="experience" class="room promotion" :class="{ flood: flooding.experience }">
            <h1>スポーツ・クラブ活動・文化活動などの体験から得たもの</h1>
            <writing :value="data.experience" @flood="onFlood('experience', $event)"></writing>
        </section>
    </div>
    <div class="floor">
        <section id="hobby" class="room promotion" :class="{ flood: flooding.hobby }">
            <h1>趣味・特技</h1>
            <writing :value="data.hobby" @flood="onFlood('hobby', $event)"></writing>
        </section>
    </div>
    <div class="floor">
        <section id="strong" class="room promotion" :class="{ flood: flooding.strong }">
            <h1>長所・特徴</h1>
            <writing :value="data.strong" @flood="onFlood('strong', $event)"></writing>
        </section>
    </div>
    </article>
    `
});


let VueTd = Content.extend({
    template: "<td class='content'>{{value}}</td>"
});

let EventTable = Vue.extend({
    components: { VueTd },
    props: ["title", "value"],
    data() {
        return { flooding: {} };
    },
    template: `
    <tbody>
        <tr>
            <th>{{title[0]}}</th>
            <th>{{title[1]}}</th>
            <th>{{title[2]}}</th>
        </tr>
        <template v-if="value.length">
        <template v-for="line in lines">
            <tr :class="{ flood: flooding[line[3]] }">
                <vue-td class="year" :value="line[0]"></vue-td>
                <vue-td class="month" :value="line[1]"></vue-td>
                <vue-td class="event" :value="line[2]" @flood="onFlood(line[3], $event)"></vue-td>
            </tr>
        </template>
        </template>
        <tr v-else>
            <td></td>
            <td></td>
            <td class="event">なし</td>
        </tr>
    </tbody>
    `,
    methods: {
        *_lines() {
            for (let i=0; i<this.value.length; ++i) {
                let event = this.value[i];
                let lines = event[2].split("\n");
                yield [event[0], event[1], lines[0], i];
                for (let j=1; j<lines.length; ++j) {
                    yield ["", "", lines[j], i];
                }
            };
        },
        onFlood(i, b) {
            Vue.set(this.flooding, i, b);
        }
    },
    computed: {
        lines() {
            if (this.value) return Array.from(this._lines());
            return [];
        },
        size() {
            if (this.value) return this.lines.length + 1;
            return 2;
        }
    },
    watch: {
        size() {
            this.$emit('resize', this.size);
        }
    },
    created() {
        this.$emit('resize', this.size);
    }
});

let LicenseBuilding = Vue.extend({
    components: { EventTable },
    props: ["data", "max-line"],
    data() {
        return { "line": 0 };
    },
    template: `
    <table id="license" class="building events" :class="{ flood: maxLine < line }">
        <colgroup>
            <col span=1 class="year-col">
            <col span=1 class="month-col">
            <col span=1 class="event-col">
        </colgroup>
        <event-table :title="['年', '月', '免許・資格']" :value="data" @resize="onResize"></event-table>
        <tfoot>
            <tr v-for="_ in empties" class="empty">
                <td></td>
                <td></td>
                <td></td>
            </tr>
        </tfoot>
    </table>
    `,
    computed: {
        empties() {
            if (this.maxLine < this.line) return [];
            return new Array(this.maxLine-this.line);
        }
    },
    methods: {
        onResize(n) {
            this.line = n;
        }
    }
})

let HistoryBuilding = Vue.extend({
    components: { EventTable },
    props: ["data", "max-line"],
    data() {
        return {
            "lineE": 0,
            "lineW": 0,
        };
    },
    template: `
    <table id="history" class="building events" :class="{ flood: maxLine < lineE + lineW }">
        <colgroup>
            <col span=1 class="year-col">
            <col span=1 class="month-col">
            <col span=1 class="event-col">
        </colgroup>
        <thead>
            <tr>
                <th>年</th>
                <th>月</th>
                <th>学歴・職歴</th>
            </tr>
        </thead>
        <event-table id="education"
            :title="['', '', '学歴']" :value="data.education"
            @resize="onResizeE" @click.native="onClick('education')">
        </event-table>
        <event-table id="work"
            :title="['', '', '職歴']" :value="data.work"
            @resize="onResizeW" @click.native="onClick('work')">
        </event-table>
        <tfoot>
            <tr>
                <td></td>
                <td></td>
                <td>以上</td>
            </tr>
            <tr v-for="_ in empties" class="empty">
                <td></td>
                <td></td>
                <td></td>
            </tr>
        </tfoot>
    </table>
    `,
    computed: {
        empties() {
            if (this.maxLine < this.lineE + this.lineW) return [];
            return new Array(this.maxLine-this.lineE-this.lineW);
        }
    },
    methods: {
        onClick(name) {
            this.$emit(`click-${name}`);
        },
        onResizeE(n) {
            this.lineE = n;
        },
        onResizeW(n) {
            this.lineW = n;
        }
    }
});

let EventEditor = Vue.extend({
    props: ["data", "label", "name"],
    data() {
        return {
            newevent: ["", "", ""]
        }
    },
    template: `
    <form class="editor pure-form">
        <legend>{{label}}</legend>
        <table class="pure-table">
            <thead>
                <tr>
                    <th></th>
                    <th>年</th>
                    <th>月</th>
                    <th>事柄</th>
                </tr>
                <tr>
                    <td>
                        <button class="pure-button" @click.prevent="onAdd">+</button>
                    </td>
                    <td>
                        <input type="number" name="year"
                            class="year" :value="newevent[0]"
                            min=1970 max=2020 @change="onChange($event, 0)"> 
                    </td>
                    <td>
                        <input type="number" name="month"
                            class="month" :value="newevent[1]"
                            min=1 max=12 @change="onChange($event, 1)">
                    </td>
                    <td>
                        <textarea class="event"
                            :value="newevent[2]" @change="onChange($event, 2)">
                        </textarea>
                    </td>
                </tr>
            </thead>
            <tbody>
                <tr v-for="(e, i) in data">
                    <th><button class="pure-button" @click.prevent="onRemove(i)">-</button></th>
                    <td>{{e[0]}}</td>
                    <td>{{e[1]}}</td>
                    <td>{{e[2]}}</td>
                </tr>
            </tbody>
        </table>
    </form>
    `,
    methods: {
        onChange(e, i) {
            Vue.set(this.newevent, i, e.target.value);
        },
        onAdd() {
            this.$emit("add", this.name, this.newevent);
            this.newevent = ["", "", ""];
        },
        onRemove(i) {
            this.newevent = this.data[i];
            this.$emit("remove", this.name, i);
        }
    }
});

let TodayEditor = Vue.extend({
    props: ["today"],
    template: `
    <form class="editor pure-form">
    <fieldset>
        <legend>日付</legend>
        <input
            type="number" placeholder="年" :value="today[0]"
            @change="onChange($event, 'today', 0)"
            @input="onChange($event, 'today', 0)">
        <input
            type="number" placeholder="月" :value="today[1]"
            @change="onChange($event, 'today', 1)"
            @input="onChange($event, 'today', 1)">
        <input
            type="number" placeholder="日" :value="today[2]"
            @change="onChange($event, 'today', 2)"
            @input="onChange($event, 'today', 2)">
    </fieldset>
    </form>
    `,
    methods: {
        onChange(event, name, i) {
            this.$emit("change", name, i, event.target.value);
        }
    }
});

let BasicsEditor = Vue.extend({
    props: ["data"],
    template: `
    <form class="editor pure-form">
    <fieldset class="pure-group">
        <legend>氏名</legend>
        <input
            type="text" class="pure-input-1" placeholder="氏名"
            :value="data.name[0]"
            @change="onChange($event, 'name', 0)"
            @input="onChange($event, 'name', 0)">
        <input
            type="text" class="pure-input-1" placeholder="ふりがな"
            :value="data.name[1]"
            @change="onChange($event, 'name', 1)"
            @input="onChange($event, 'name', 1)">
    </fieldset>
    <fieldset>
        <legend>生年月日</legend>
        <input
            type="number" placeholder="年" :value="data.birthday[0]"
            @change="onChange($event, 'birthday', 0)"
            @input="onChange($event, 'birthday', 0)">
        <input
            type="number" placeholder="月" :value="data.birthday[1]"
            @change="onChange($event, 'birthday', 1)"
            @input="onChange($event, 'birthday', 1)">
        <input
            type="number" placeholder="日" :value="data.birthday[2]"
            @change="onChange($event, 'birthday', 2)"
            @input="onChange($event, 'birthday', 2)">
    </fieldset>
    <fieldset class="pure-group">
        <legend>性別</legend>
        <input
            type="text" class="pure-input-1-8" placeholder="性別"
            :value="data.sex"
            @change="onChange($event, 'sex')"
            @input="onChange($event, 'sex')">
    </fieldset>
    </form>
    `,
    methods: {
        onChange(event, name, i) {
            if (i === undefined) {
                this.$emit("change", name, event.target.value);
            } else {
                this.$emit("change", name, i, event.target.value);
            }
        }
    }
});

let ContactEditor = Vue.extend({
    props: ["data"],
    template: `
    <form class="editor pure-form pure-g">
    <fieldset class="pure-group pure-u-1">
        <legend>現住所</legend>
        <input
            type="text" class="pure-input-1" placeholder="郵便番号"
            :value="data.post"
            @change="onChange($event, 'post')"
            @input="onChange($event, 'post')">
        <textarea
            class="pure-input-1" placeholder="現住所"
            :value="data.address[0]"
            @change="onChange($event, 'address', 0)"
            @input="onChange($event, 'address', 0)">
        </textarea>
        <input
            type="text" class="pure-input-1" placeholder="ふりがな"
            :value="data.address[1]"
            @change="onChange($event, 'address', 1)"
            @input="onChange($event, 'address', 1)">
    </fieldset>
    <fieldset class="pure-u-1">
        <legend>電話</legend>
        <input
            type="tel" class="pure-input-1" placeholder="電話"
            :value="data.telephone"
            @change="onChange($event, 'telephone')"
            @input="onChange($event, 'telephone')">
    </fieldset>
    <fieldset class="pure-u-1">
        <legend>携帯</legend>
        <input
            type="tel" class="pure-input-1" placeholder="携帯"
            :value="data.cellphone"
            @change="onChange($event, 'cellphone')"
            @input="onChange($event, 'cellphone')">
    </fieldset>
    <fieldset class="pure-u-1">
        <legend>E-mail</legend>
        <input
            type="email" class="pure-input-1" placeholder="E-mail"
            :value="data.mail"
            @change="onChange($event, 'mail')"
            @input="onChange($event, 'mail')">
    </fieldset>
    <fieldset class="pure-group pure-u-1">
        <legend>連絡先</legend>
        <textarea
            class="pure-input-1" placeholder="連絡先"
            :value="data.altAddress"
            @change="onChange($event, 'altAddress', 0)"
            @input="onChange($event, 'altAddress', 0)">
        </textarea>
    </fieldset>
    <fieldset class="pure-u-1">
        <legend>連絡先電話</legend>
        <input
            type="tel" class="pure-input-1" placeholder="電話"
            :value="data.altPhone"
            @change="onChange($event, 'altPhone')"
            @input="onChange($event, 'altPhone')">
    </fieldset>
    </form>
    `,
    methods: {
        onChange(event, name, i) {
            if (i === undefined) {
                this.$emit("change", name, event.target.value);
            } else {
                this.$emit("change", name, i, event.target.value);
            }
        }
    }
});

let PromotionEditor = Vue.extend({
    props: ["data"],
    template: `
    <form class="pure-form editor">
    <fieldset>
        <legend>志望動機</legend>
        <textarea
            class="pure-input-1" :value="data.motivation"
            @change="onChange($event, 'motivation')"
            @input="onChange($event, 'motivation')">
        </textarea>
    </fieldset>
    <fieldset>
        <legend>得意科目及び研究課題</legend>
        <textarea
            class="pure-input-1" :value="data.study"
            @change="onChange($event, 'study')"
            @input="onChange($event, 'study')">
        </textarea>
    </fieldset>
    <fieldset>
        <legend>スポーツ・クラブ活動・文化活動などの体験から得たもの</legend>
        <textarea
            class="pure-input-1" :value="data.experience"
            @change="onChange($event, 'experience')"
            @input="onChange($event, 'experience')">
        </textarea>
    </fieldset>
    <fieldset>
        <legend>趣味・特技</legend>
        <textarea
            class="pure-input-1" :value="data.hobby"
            @change="onChange($event, 'hobby')"
            @input="onChange($event, 'hobby')">
        </textarea>
    </fieldset>
    <fieldset>
        <legend>長所・特徴</legend>
        <textarea
            class="pure-input-1" :value="data.strong"
            @change="onChange($event, 'strong')"
            @input="onChange($event, 'strong')">
        </textarea>
    </fieldset>
    </form>
    `,
    methods: {
        onChange(event, name) {
            this.$emit("change", name, event.target.value);
        }
    }
});

let vue = new Vue({
    components: {
        BasicsBuilding,
        ContactBuilding,
        PromotionBuilding,
        HistoryBuilding,
        LicenseBuilding,
        TodayEditor,
        EventEditor,
        BasicsEditor,
        ContactEditor,
        PromotionEditor
    },
    el: "#app",
    data: {
        "resume": {
            "today": [2018, 7, 1],
            "name": ["履歴書 太郎", "りれきしょ たろう"],
            "address": [
                "東京都 非実在区 架空町 1丁目7-1",
                "とうきょうと ひじつざいく かくうちょう"
            ],
            "post": "000-0000",
            "birthday": [1995, 4, 1],
            "sex": "男",
            "telephone": "000-0000-0000",
            "cellphone": "000-0000-0000",
            "mail": "this-is@exmaple.com",
            "education": [
                [2011, 3, "非実在中学校 卒業"],
                [2011, 4, "非実在高等学校 入学"],
                [2014, 3, "非実在高等学校 卒業"],
                [2014, 4, "東京大学 理科13類 入学"],
                [2016, 4, "東京大学 空想学部 黒魔術科 進学"]
            ],
            "work": [],
            "license": [
                [2015, 8, "普通運転免許証"],
                [2016, 2, "TOEIC 5千兆点"]
            ],
            "motivation": "太陽が黄色かったから。",
            "study": "黒魔術。",
            "experience": "特になし。",
            "hobby": "履歴書を書く。",
            "strong": "履歴書を書く。"
        },
        "target": null
    },
    computed: {
        basics() {
            return {
                name: this.resume.name,
                birthday: this.resume.birthday,
                today: this.resume.today,
                sex: this.resume.sex
            };
        },
        contact() {
            return {
                post: this.resume.post,
                address: this.resume.address,
                telephone: this.resume.telephone,
                cellphone: this.resume.cellphone,
                mail: this.resume.mail,
                altAddress: this.resume.altAddress,
                altPhone: this.resume.altPhone
            };
        },
        history() {
            return {
                education: this.resume.education,
                work: this.resume.work
            };
        },
        promotion() {
            return {
                motivation: this.resume.motivation,
                study: this.resume.study,
                experience: this.resume.experience,
                hobby: this.resume.hobby,
                strong: this.resume.strong
            };
        }
    },
    methods: {
        onClick(name) {
            this.target = name;
        },
        onChange(id, v0, v1) {
            if (id == 'name' || id == 'address' || id == 'birthday' || id == 'today') {
                Vue.set(this.resume[id], v0, v1);
            } else if (id=='promotion') {
                Vue.set(this.resume.promotion[v0], 2, v1);
            } else {
                this.resume[id] = v0;
            }
        },
        sort(id) {
            this.resume[id].sort((a, b) => {
                if (a[0] > b[0]) return 1;
                if (a[0] < b[0]) return -1;
                if (a[1] > b[1]) return 1;
                if (a[1] < b[1]) return -1;
                return 0;
            });
        },
        addEvent(id, event) {
            this.resume[id].push(event);
            this.sort(id);
        },
        removeEvent(id, i) {
            this.resume[id].splice(i, 1);
        },
        print() {
            window.print();
        },
        download() {
            let blob = new Blob(
                [JSON.stringify(this.resume, null, 2)],
                { type: "text/plain" }
            );
            document.getElementById('download').href = window.URL.createObjectURL(blob);
        },
        load() {
            this.target = "load";
        },
        onLoadFile(e) {
            let render = new FileReader();
            render.onload = (e) => {
                let resume = JSON.parse(e.target.result);
                Vue.set(this, "resume", resume);
                this.target = null;
            };
            render.readAsText(e.target.files[0]);
        }
    }
});
