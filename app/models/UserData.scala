package models

import play.api.libs.json.Json

case class UserData(username: String, password: String)
case class PuppyItem(id: Int, text: String)

object ReadsAndWrites {
  implicit val userDataReads = Json.reads[UserData]
  implicit val userDataWrites = Json.writes[UserData]

  implicit val puppyItemReads = Json.reads[PuppyItem]
  implicit val puppyItemWrites = Json.writes[PuppyItem]
}